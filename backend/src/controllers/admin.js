const prisma = require('../config/db');
const { sendEmail } = require('../config/mailer');

// ─── Aadhaar ─────────────────────────────────────────────────────────────────

async function getAadhaarQueue(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      where: { aadhaarStatus: 'pending', aadhaarFrontUrl: { not: null } },
      select: { id: true, name: true, email: true, avatarUrl: true, aadhaarFrontUrl: true, aadhaarBackUrl: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(users);
  } catch (err) { next(err); }
}

async function approveAadhaar(req, res, next) {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: { aadhaarStatus: 'approved', aadhaarRejectionReason: null },
    });
    await prisma.adminLog.create({ data: { adminId: req.user.id, action: 'aadhaar_approved', targetType: 'user', targetId: user.id } });
    await sendEmail({ to: user.email, subject: 'Your identity is verified — onlyStuff', template: 'aadhaar_approved', vars: { name: user.name } });
    res.json({ success: true });
  } catch (err) { next(err); }
}

async function rejectAadhaar(req, res, next) {
  try {
    const { reason } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: { aadhaarStatus: 'rejected', aadhaarRejectionReason: reason },
    });
    await prisma.adminLog.create({ data: { adminId: req.user.id, action: 'aadhaar_rejected', targetType: 'user', targetId: user.id, metadata: { reason } } });
    await sendEmail({ to: user.email, subject: 'Verification issue — onlyStuff', template: 'aadhaar_rejected', vars: { name: user.name, reason } });
    res.json({ success: true });
  } catch (err) { next(err); }
}

// ─── Communities ──────────────────────────────────────────────────────────────

async function getCommunityRequests(req, res, next) {
  try {
    const requests = await prisma.community.findMany({
      where: { status: 'pending' },
      include: { requestedBy: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(requests);
  } catch (err) { next(err); }
}

async function approveCommunity(req, res, next) {
  try {
    const community = await prisma.community.update({
      where: { id: req.params.id },
      data: { status: 'active', approvedById: req.user.id },
      include: { requestedBy: true },
    });
    // Place the requesting user in this community
    await prisma.user.update({ where: { id: community.requestedById }, data: { communityId: community.id } });
    await prisma.adminLog.create({ data: { adminId: req.user.id, action: 'community_approved', targetType: 'community', targetId: community.id } });
    await sendEmail({ to: community.requestedBy.email, subject: 'Your community is live — onlyStuff', template: 'community_approved', vars: { name: community.requestedBy.name, communityName: community.name } });
    res.json(community);
  } catch (err) { next(err); }
}

async function rejectCommunity(req, res, next) {
  try {
    const { reason } = req.body;
    const community = await prisma.community.update({
      where: { id: req.params.id },
      data: { status: 'rejected', rejectionReason: reason },
      include: { requestedBy: true },
    });
    await sendEmail({ to: community.requestedBy.email, subject: 'Community request update — onlyStuff', template: 'community_rejected', vars: { name: community.requestedBy.name, communityName: community.name, reason } });
    res.json({ success: true });
  } catch (err) { next(err); }
}

// ─── Reports ──────────────────────────────────────────────────────────────────

async function getReports(req, res, next) {
  try {
    const reports = await prisma.report.findMany({
      where: { status: 'open' },
      include: { reporter: { select: { id: true, name: true } }, listing: { select: { id: true, title: true } }, reportedUser: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (err) { next(err); }
}

async function actionReport(req, res, next) {
  try {
    const { action, reason } = req.body;
    const report = await prisma.report.findUnique({ where: { id: req.params.id } });

    if (action === 'remove_listing' && report.listingId) {
      await prisma.listing.update({ where: { id: report.listingId }, data: { status: 'removed' } });
    } else if (action === 'ban_user' && report.reportedUserId) {
      await prisma.user.update({ where: { id: report.reportedUserId }, data: { bannedAt: new Date(), bannedReason: reason } });
    }

    await prisma.report.update({ where: { id: req.params.id }, data: { status: 'reviewed', reviewedById: req.user.id, reviewedAt: new Date() } });
    await prisma.adminLog.create({ data: { adminId: req.user.id, action: `report_${action}`, targetType: 'report', targetId: report.id, metadata: { reason } } });
    res.json({ success: true });
  } catch (err) { next(err); }
}

// ─── Users ────────────────────────────────────────────────────────────────────

async function listUsers(req, res, next) {
  try {
    const { q, role, aadhaarStatus, page = 1 } = req.query;
    const where = {
      ...(role && { role }),
      ...(aadhaarStatus && { aadhaarStatus }),
      ...(q && { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] }),
    };
    const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 30, take: 30 });
    res.json(users);
  } catch (err) { next(err); }
}

async function getUser(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, include: { community: true, _count: { select: { listings: true } } } });
    res.json(user);
  } catch (err) { next(err); }
}

async function actionUser(req, res, next) {
  try {
    const { action, reason, suspendUntil } = req.body;
    let data = {};
    if (action === 'ban') data = { bannedAt: new Date(), bannedReason: reason };
    else if (action === 'suspend') data = { suspendedUntil: new Date(suspendUntil) };
    else if (action === 'unban') data = { bannedAt: null, bannedReason: null };
    await prisma.user.update({ where: { id: req.params.id }, data });
    await prisma.adminLog.create({ data: { adminId: req.user.id, action: `user_${action}`, targetType: 'user', targetId: req.params.id, metadata: { reason } } });
    res.json({ success: true });
  } catch (err) { next(err); }
}

// ─── Listings ─────────────────────────────────────────────────────────────────

async function listListings(req, res, next) {
  try {
    const { status, page = 1 } = req.query;
    const listings = await prisma.listing.findMany({
      where: status ? { status } : {},
      include: { seller: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }, skip: (page - 1) * 30, take: 30,
    });
    res.json(listings);
  } catch (err) { next(err); }
}

async function actionListing(req, res, next) {
  try {
    const { action } = req.body;
    const statusMap = { approve: 'active', remove: 'removed', pause: 'paused' };
    await prisma.listing.update({ where: { id: req.params.id }, data: { status: statusMap[action] } });
    await prisma.adminLog.create({ data: { adminId: req.user.id, action: `listing_${action}`, targetType: 'listing', targetId: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

async function getAnalytics(req, res, next) {
  try {
    const [userCount, listingCount, orderCount, groupBuyCount] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'active' } }),
      prisma.order.count(),
      prisma.groupBuy.count(),
    ]);
    res.json({ userCount, listingCount, orderCount, groupBuyCount });
  } catch (err) { next(err); }
}

async function getCommunityAnalytics(req, res, next) {
  try {
    const communities = await prisma.community.findMany({
      where: { status: 'active' },
      include: { _count: { select: { members: true, listings: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(communities);
  } catch (err) { next(err); }
}

async function getGroupBuyAnalytics(req, res, next) {
  try {
    const stats = await prisma.groupBuy.groupBy({
      by: ['status'],
      _count: true,
    });
    res.json(stats);
  } catch (err) { next(err); }
}

// ─── Delivery Partners ────────────────────────────────────────────────────────

async function listDeliveryPartners(req, res, next) {
  try {
    const partners = await prisma.deliveryPartner.findMany();
    res.json(partners);
  } catch (err) { next(err); }
}

async function createDeliveryPartner(req, res, next) {
  try {
    const partner = await prisma.deliveryPartner.create({ data: req.body });
    res.status(201).json(partner);
  } catch (err) { next(err); }
}

async function updateDeliveryPartner(req, res, next) {
  try {
    const partner = await prisma.deliveryPartner.update({ where: { id: req.params.id }, data: req.body });
    res.json(partner);
  } catch (err) { next(err); }
}

module.exports = { getAadhaarQueue, approveAadhaar, rejectAadhaar, getCommunityRequests, approveCommunity, rejectCommunity, getReports, actionReport, listUsers, getUser, actionUser, listListings, actionListing, getAnalytics, getCommunityAnalytics, getGroupBuyAnalytics, listDeliveryPartners, createDeliveryPartner, updateDeliveryPartner };
