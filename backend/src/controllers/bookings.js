const prisma = require('../config/db');
const { notFound, forbidden, badRequest } = require('../utils/errors');
const { getIO } = require('../config/socket');
const { sendEmail } = require('../config/mailer');

async function createBooking(req, res, next) {
  try {
    const { listingId, slotDate, slotStart, slotEnd, recurrence, notes } = req.body;
    const listing = await prisma.listing.findUnique({ where: { id: listingId }, include: { seller: true, serviceConfig: true } });
    if (!listing || listing.type !== 'service') throw notFound('Service listing not found');
    if (listing.sellerId === req.user.id) throw badRequest('Cannot book your own service');

    const booking = await prisma.booking.create({
      data: {
        listingId, buyerId: req.user.id,
        slotDate: new Date(slotDate), slotStart, slotEnd,
        recurrence: recurrence || 'none',
        notes, status: 'pending',
      },
    });

    await sendEmail({ to: listing.seller.email, subject: 'New booking request — onlyStuff', template: 'booking_request', vars: { sellerName: listing.seller.name, listingTitle: listing.title, date: slotDate, time: slotStart } });

    getIO().to(`user:${listing.sellerId}`).emit('new_notification', { type: 'booking_request', bookingId: booking.id });
    res.status(201).json(booking);
  } catch (err) { next(err); }
}

async function listBookings(req, res, next) {
  try {
    const { role = 'buyer' } = req.query;
    const where = role === 'seller'
      ? { listing: { sellerId: req.user.id } }
      : { buyerId: req.user.id };
    const bookings = await prisma.booking.findMany({
      where, include: { listing: { select: { title: true } } },
      orderBy: { slotDate: 'asc' },
    });
    res.json(bookings);
  } catch (err) { next(err); }
}

async function getBooking(req, res, next) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { listing: { include: { seller: { select: { id: true, name: true } } } }, buyer: { select: { id: true, name: true } } },
    });
    if (!booking) throw notFound();
    const sellerId = booking.listing.seller.id;
    if (booking.buyerId !== req.user.id && sellerId !== req.user.id) throw forbidden();
    res.json(booking);
  } catch (err) { next(err); }
}

async function confirmBooking(req, res, next) {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { listing: true, buyer: true } });
    if (!booking) throw notFound();
    if (booking.listing.sellerId !== req.user.id) throw forbidden('Only provider can confirm');
    const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'confirmed' } });
    await sendEmail({ to: booking.buyer.email, subject: 'Booking confirmed — onlyStuff', template: 'booking_confirmed', vars: { buyerName: booking.buyer.name, listingTitle: booking.listing.title, date: booking.slotDate, time: booking.slotStart } });
    getIO().to(`user:${booking.buyerId}`).emit('new_notification', { type: 'booking_confirmed', bookingId: booking.id });
    res.json(updated);
  } catch (err) { next(err); }
}

async function declineBooking(req, res, next) {
  try {
    const { reason } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { listing: true } });
    if (!booking) throw notFound();
    if (booking.listing.sellerId !== req.user.id) throw forbidden();
    const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'declined', cancelReason: reason } });
    getIO().to(`user:${booking.buyerId}`).emit('new_notification', { type: 'booking_declined', bookingId: booking.id, reason });
    res.json(updated);
  } catch (err) { next(err); }
}

async function rescheduleBooking(req, res, next) {
  try {
    const { slotDate, slotStart, slotEnd } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { listing: true } });
    if (!booking) throw notFound();
    const isParty = booking.buyerId === req.user.id || booking.listing.sellerId === req.user.id;
    if (!isParty) throw forbidden();
    if (booking.rescheduleCount >= 2) throw badRequest('Maximum reschedules reached');
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { slotDate: new Date(slotDate), slotStart, slotEnd, status: 'pending', rescheduleCount: { increment: 1 } },
    });
    res.json(updated);
  } catch (err) { next(err); }
}

async function cancelBooking(req, res, next) {
  try {
    const { reason } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { listing: true } });
    if (!booking) throw notFound();
    const isParty = booking.buyerId === req.user.id || booking.listing.sellerId === req.user.id;
    if (!isParty) throw forbidden();
    const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'cancelled', cancelReason: reason } });
    res.json(updated);
  } catch (err) { next(err); }
}

async function closeBooking(req, res, next) {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { listing: true } });
    if (!booking) throw notFound();
    const isParty = booking.buyerId === req.user.id || booking.listing.sellerId === req.user.id;
    if (!isParty) throw forbidden();
    const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'closed', closedById: req.user.id, closedAt: new Date() } });
    res.json(updated);
  } catch (err) { next(err); }
}

async function disputeBooking(req, res, next) {
  try {
    const { reason } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { listing: true } });
    if (!booking) throw notFound();
    const isParty = booking.buyerId === req.user.id || booking.listing.sellerId === req.user.id;
    if (!isParty) throw forbidden();
    if (booking.status !== 'closed') throw badRequest('Can only dispute a closed booking');
    const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'disputed', disputeReason: reason } });
    res.json(updated);
  } catch (err) { next(err); }
}

module.exports = { createBooking, listBookings, getBooking, confirmBooking, declineBooking, rescheduleBooking, cancelBooking, closeBooking, disputeBooking };
