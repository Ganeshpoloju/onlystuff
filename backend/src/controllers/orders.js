const prisma = require('../config/db');
const { notFound, forbidden, badRequest } = require('../utils/errors');
const { getIO } = require('../config/socket');
const { sendEmail } = require('../config/mailer');

async function placeOrder(req, res, next) {
  try {
    const { listingId, quantity, fulfillmentMethod, deliveryPartner, deliveryFee } = req.body;
    const listing = await prisma.listing.findUnique({ where: { id: listingId }, include: { seller: true } });
    if (!listing || listing.status !== 'active') throw notFound('Listing not available');
    if (listing.sellerId === req.user.id) throw badRequest('Cannot order your own listing');
    if (listing.moq && quantity < listing.moq) throw badRequest(`Minimum order quantity is ${listing.moq}`);

    const unitPrice = listing.pricingModel === 'fixed' ? listing.fixedPrice : resolveSlabPrice(listing, quantity);
    const order = await prisma.order.create({
      data: {
        listingId, buyerId: req.user.id, sellerId: listing.sellerId,
        quantity: parseInt(quantity), unitPrice, totalPrice: unitPrice * quantity,
        fulfillmentMethod, deliveryPartner, deliveryFee: deliveryFee ? parseFloat(deliveryFee) : null,
        status: 'placed',
      },
    });

    await sendEmail({ to: listing.seller.email, subject: 'New order received — onlyStuff', template: 'order_placed', vars: { sellerName: listing.seller.name, listingTitle: listing.title, quantity, totalPrice: order.totalPrice } });

    getIO().to(`user:${listing.sellerId}`).emit('new_notification', { type: 'order_placed', orderId: order.id });
    res.status(201).json(order);
  } catch (err) { next(err); }
}

function resolveSlabPrice(listing, qty) {
  // Resolved from priceSlabs — simplified here; full impl queries DB
  return listing.fixedPrice || 0;
}

async function listOrders(req, res, next) {
  try {
    const { role = 'buyer' } = req.query;
    const where = role === 'seller' ? { sellerId: req.user.id } : { buyerId: req.user.id };
    const orders = await prisma.order.findMany({
      where, include: { listing: { select: { title: true, photos: true } }, buyer: { select: { name: true } }, seller: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) { next(err); }
}

async function getOrder(req, res, next) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { listing: true, buyer: { select: { id: true, name: true, avatarUrl: true } }, seller: { select: { id: true, name: true, avatarUrl: true } } },
    });
    if (!order) throw notFound();
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) throw forbidden();
    res.json(order);
  } catch (err) { next(err); }
}

async function confirmOrder(req, res, next) {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw notFound();
    if (order.sellerId !== req.user.id) throw forbidden('Only seller can confirm');
    if (order.status !== 'placed') throw badRequest('Order cannot be confirmed in current state');
    const updated = await prisma.order.update({ where: { id: order.id }, data: { status: 'confirmed' } });
    getIO().to(`user:${order.buyerId}`).emit('new_notification', { type: 'order_confirmed', orderId: order.id });
    res.json(updated);
  } catch (err) { next(err); }
}

async function closeOrder(req, res, next) {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw notFound();
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) throw forbidden();
    if (!['confirmed', 'in_progress'].includes(order.status)) throw badRequest('Cannot close order in current state');

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'closed', closedById: req.user.id, closedAt: new Date() },
    });

    const otherId = req.user.id === order.buyerId ? order.sellerId : order.buyerId;
    getIO().to(`user:${otherId}`).emit('new_notification', { type: 'order_closed', orderId: order.id });

    // Schedule auto-fully-closed after 48h (handled by a cron job or delayed check)
    res.json(updated);
  } catch (err) { next(err); }
}

async function disputeOrder(req, res, next) {
  try {
    const { reason } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw notFound();
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) throw forbidden();
    if (order.status !== 'closed') throw badRequest('Can only dispute a closed order within 48 hours');

    const hoursSinceClosed = (Date.now() - new Date(order.closedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceClosed > 48) throw badRequest('Dispute window has expired');

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'disputed', disputeReason: reason, disputedById: req.user.id },
    });
    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'admin' } });
    for (const admin of admins) {
      await sendEmail({ to: admin.email, subject: 'New order dispute — onlyStuff', template: 'dispute_raised', vars: { adminName: admin.name, orderId: order.id, reason } });
    }
    res.json(updated);
  } catch (err) { next(err); }
}

async function getReviews(req, res, next) {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.status !== 'fully_closed') throw badRequest('Reviews only available after order is fully closed');
    const reviews = await prisma.review.findMany({ where: { orderId: req.params.id } });
    res.json(reviews);
  } catch (err) { next(err); }
}

async function postReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw notFound();
    if (order.status !== 'fully_closed') throw badRequest('Can only review after order is fully closed');
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) throw forbidden();

    const revieweeId = req.user.id === order.buyerId ? order.sellerId : order.buyerId;
    const existing = await prisma.review.findFirst({ where: { orderId: order.id, reviewerId: req.user.id } });
    if (existing) throw badRequest('Already reviewed this order');

    const reviewWindowDays = 14;
    const daysSinceClosed = (Date.now() - new Date(order.fullyClosedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceClosed > reviewWindowDays) throw badRequest('Review window has expired');

    const review = await prisma.review.create({
      data: { orderId: order.id, reviewerId: req.user.id, revieweeId, rating: parseInt(rating), comment },
    });
    res.status(201).json(review);
  } catch (err) { next(err); }
}

module.exports = { placeOrder, listOrders, getOrder, confirmOrder, closeOrder, disputeOrder, getReviews, postReview };
