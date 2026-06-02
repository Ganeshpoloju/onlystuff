const prisma = require('../config/db');
const { notFound } = require('../utils/errors');
const storage = require('../services/storage/index');
const { sendEmail } = require('../config/mailer');

async function getPublicProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, avatarUrl: true, role: true, aadhaarStatus: true,
        communityId: true, createdAt: true,
        community: { select: { name: true } },
        _count: { select: { listings: true } },
      },
    });
    if (!user) throw notFound('User not found');
    res.json(user);
  } catch (err) { next(err); }
}

async function updateProfile(req, res, next) {
  try {
    const { name, bio, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, bio, phone },
    });
    res.json(updated);
  } catch (err) { next(err); }
}

async function uploadAadhaar(req, res, next) {
  try {
    const front = req.files?.front?.[0];
    const back = req.files?.back?.[0];
    if (!front || !back) return res.status(400).json({ error: 'Both front and back images required' });

    const frontUrl = await storage.upload(front.buffer, `aadhaar/${req.user.id}_front_${Date.now()}.jpg`, front.mimetype);
    const backUrl = await storage.upload(back.buffer, `aadhaar/${req.user.id}_back_${Date.now()}.jpg`, back.mimetype);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { aadhaarFrontUrl: frontUrl, aadhaarBackUrl: backUrl, aadhaarStatus: 'pending' },
    });
    res.json({ message: 'Aadhaar uploaded successfully, pending admin review' });
  } catch (err) { next(err); }
}

async function getNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (err) { next(err); }
}

async function markNotificationRead(req, res, next) {
  try {
    await prisma.notification.update({
      where: { id: req.params.id, userId: req.user.id },
      data: { readAt: new Date() },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
}

async function vouchUser(req, res, next) {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot vouch for yourself' });
    const existing = await prisma.vouch.findFirst({
      where: { voucherId: req.user.id, voucheeId: req.params.id, revokedAt: null },
    });
    if (existing) return res.status(400).json({ error: 'Already vouched' });
    await prisma.vouch.create({ data: { voucherId: req.user.id, voucheeId: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
}

async function revokeVouch(req, res, next) {
  try {
    await prisma.vouch.updateMany({
      where: { voucherId: req.user.id, voucheeId: req.params.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
}

module.exports = { getPublicProfile, updateProfile, uploadAadhaar, getNotifications, markNotificationRead, vouchUser, revokeVouch };
