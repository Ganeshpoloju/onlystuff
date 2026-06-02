const prisma = require('../config/db');
const storage = require('../services/storage/index');
const { getIO } = require('../config/socket');

async function listConversations(req, res, next) {
  try {
    // Get distinct listing conversations for this user
    const conversations = await prisma.message.findMany({
      where: { OR: [{ senderId: req.user.id }, { receiverId: req.user.id }] },
      distinct: ['listingId'],
      orderBy: { createdAt: 'desc' },
      include: {
        listing: { select: { id: true, title: true, photos: true } },
        sender: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    res.json(conversations);
  } catch (err) { next(err); }
}

async function getMessages(req, res, next) {
  try {
    const { listingId } = req.params;
    const messages = await prisma.message.findMany({
      where: {
        listingId,
        OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
    // Mark as read
    await prisma.message.updateMany({
      where: { listingId, receiverId: req.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    res.json(messages);
  } catch (err) { next(err); }
}

async function sendMessage(req, res, next) {
  try {
    const { listingId } = req.params;
    const { content, receiverId } = req.body;

    const imageUrls = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const url = await storage.upload(file.buffer, `chat/${Date.now()}_${file.originalname}`, file.mimetype);
        imageUrls.push(url);
      }
    }

    const msg = await prisma.message.create({
      data: { listingId, senderId: req.user.id, receiverId, content, imageUrls },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    });

    getIO().to(`listing:${listingId}`).emit('chat:message', msg);
    getIO().to(`user:${receiverId}`).emit('new_notification', { type: 'new_message', listingId });

    res.status(201).json(msg);
  } catch (err) { next(err); }
}

module.exports = { listConversations, getMessages, sendMessage };
