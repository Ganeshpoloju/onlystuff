const prisma = require('../config/db');

async function listCommunities(req, res, next) {
  try {
    const communities = await prisma.community.findMany({
      where: { status: 'active' },
      select: { id: true, name: true, address: true, memberCount: true, activeListingCount: true },
      orderBy: { name: 'asc' },
    });
    res.json(communities);
  } catch (err) { next(err); }
}

async function getCommunity(req, res, next) {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { members: true } } },
    });
    if (!community) return res.status(404).json({ error: 'Community not found' });
    res.json(community);
  } catch (err) { next(err); }
}

async function requestCommunity(req, res, next) {
  try {
    const { name, address, lat, lng, householdCount } = req.body;
    if (!name || !address || !lat || !lng) {
      return res.status(400).json({ error: 'name, address, lat, lng are required' });
    }
    const request = await prisma.community.create({
      data: {
        name,
        address,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        householdCount: householdCount ? parseInt(householdCount) : null,
        status: 'pending',
        requestedById: req.user.id,
      },
    });
    res.status(201).json(request);
  } catch (err) { next(err); }
}

module.exports = { listCommunities, getCommunity, requestCommunity };
