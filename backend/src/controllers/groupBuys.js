const prisma = require('../config/db');
const { notFound, forbidden, badRequest } = require('../utils/errors');
const { getIO } = require('../config/socket');

async function listGroupBuys(req, res, next) {
  try {
    const { listingId } = req.query;
    const where = { status: 'open', ...(listingId && { listingId }) };
    const groupBuys = await prisma.groupBuy.findMany({
      where,
      include: { initiator: { select: { id: true, name: true } }, _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(groupBuys);
  } catch (err) { next(err); }
}

async function getGroupBuy(req, res, next) {
  try {
    const gb = await prisma.groupBuy.findUnique({
      where: { id: req.params.id },
      include: { members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } }, listing: { select: { title: true, moq: true } } },
    });
    if (!gb) throw notFound();
    res.json(gb);
  } catch (err) { next(err); }
}

async function initiateGroupBuy(req, res, next) {
  try {
    const { listingId, targetQty, targetPricePerUnit } = req.body;
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw notFound('Listing not found');
    if (listing.moq && targetQty < listing.moq) throw badRequest(`Target must be ≥ MOQ (${listing.moq})`);

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const gb = await prisma.groupBuy.create({
      data: { listingId, initiatorId: req.user.id, targetQty: parseInt(targetQty), committedQty: 0, targetPricePerUnit: parseFloat(targetPricePerUnit), status: 'open', expiresAt },
    });

    // Initiator auto-joins
    await prisma.groupBuyMember.create({ data: { groupBuyId: gb.id, userId: req.user.id, quantity: 0 } });
    res.status(201).json(gb);
  } catch (err) { next(err); }
}

async function joinGroupBuy(req, res, next) {
  try {
    const { quantity } = req.body;
    const gb = await prisma.groupBuy.findUnique({ where: { id: req.params.id }, include: { members: true } });
    if (!gb || gb.status !== 'open') throw badRequest('Group buy is not open');

    const already = gb.members.find(m => m.userId === req.user.id);
    if (already) throw badRequest('Already in this group buy');

    const newQty = gb.committedQty + parseInt(quantity);
    await prisma.groupBuyMember.create({ data: { groupBuyId: gb.id, userId: req.user.id, quantity: parseInt(quantity) } });
    const updated = await prisma.groupBuy.update({ where: { id: gb.id }, data: { committedQty: newQty } });

    getIO().to(`groupbuy:${gb.id}`).emit('groupbuy:member_joined', { userId: req.user.id, committedQty: newQty, targetQty: gb.targetQty });

    // Auto-lock when target reached
    if (newQty >= gb.targetQty) {
      await prisma.groupBuy.update({ where: { id: gb.id }, data: { status: 'locked' } });
      getIO().to(`groupbuy:${gb.id}`).emit('groupbuy:locked', { id: gb.id });
    }

    res.json(updated);
  } catch (err) { next(err); }
}

async function extendGroupBuy(req, res, next) {
  try {
    const gb = await prisma.groupBuy.findUnique({ where: { id: req.params.id } });
    if (!gb) throw notFound();
    if (gb.initiatorId !== req.user.id) throw forbidden('Only initiator can extend');
    if (gb.status !== 'open') throw badRequest('Can only extend an open group buy');
    if (gb.extendedAt) throw badRequest('Already extended once');

    const newExpiry = new Date(gb.expiresAt.getTime() + 24 * 60 * 60 * 1000);
    const updated = await prisma.groupBuy.update({ where: { id: gb.id }, data: { expiresAt: newExpiry, extendedAt: new Date() } });
    res.json(updated);
  } catch (err) { next(err); }
}

async function getGroupBuyChat(req, res, next) {
  try {
    const messages = await prisma.groupBuyMessage.findMany({
      where: { groupBuyId: req.params.id },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (err) { next(err); }
}

async function sendGroupBuyMessage(req, res, next) {
  try {
    const { content } = req.body;
    const msg = await prisma.groupBuyMessage.create({
      data: { groupBuyId: req.params.id, senderId: req.user.id, content },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    });
    getIO().to(`groupbuy:${req.params.id}`).emit('chat:message', msg);
    res.status(201).json(msg);
  } catch (err) { next(err); }
}

module.exports = { listGroupBuys, getGroupBuy, initiateGroupBuy, joinGroupBuy, extendGroupBuy, getGroupBuyChat, sendGroupBuyMessage };
