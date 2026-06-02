const prisma = require('../config/db');
const { geocode, haversineKm } = require('../services/geoService');

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
    const { name, address, householdCount } = req.body;
    let { lat, lng } = req.body;
    if (!name || !address) {
      return res.status(400).json({ error: 'name and address are required' });
    }
    // If lat/lng not provided by the map pin, geocode the address
    if (!lat || !lng) {
      const coords = await geocode(address);
      if (!coords) return res.status(400).json({ error: 'Could not geocode address. Please drop a pin on the map.' });
      lat = coords.lat;
      lng = coords.lng;
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const request = await prisma.community.create({
      data: {
        name, address, slug,
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

async function getNearestCommunity(req, res, next) {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
    const { findNearestCommunity } = require('../services/geoService');
    const community = await findNearestCommunity(prisma, parseFloat(lat), parseFloat(lng));
    res.json({ community });
  } catch (err) { next(err); }
}

module.exports = { listCommunities, getCommunity, requestCommunity, getNearestCommunity };
