const prisma = require('../config/db');
const storage = require('../services/storage/index');
const { generateSlots } = require('../utils/slots');
const { notFound, forbidden } = require('../utils/errors');

async function searchListings(req, res, next) {
  try {
    const { q, type, category, minPrice, maxPrice, hasGroupBuy, radiusKm = 5, lat, lng, page = 1, limit = 20 } = req.query;

    const where = {
      status: 'active',
      ...(type && { type }),
      ...(category && { category }),
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        seller: { select: { id: true, name: true, avatarUrl: true } },
        community: { select: { id: true, name: true, lat: true, lng: true } },
        priceSlabs: { orderBy: { position: 'asc' } },
        _count: { select: { groupBuys: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    res.json({ listings, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
}

async function getListing(req, res, next) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { select: { id: true, name: true, avatarUrl: true, communityId: true } },
        community: { select: { id: true, name: true } },
        serviceConfig: true,
        priceSlabs: { orderBy: { position: 'asc' } },
        groupBuys: { where: { status: 'open' }, take: 5 },
      },
    });
    if (!listing) throw notFound('Listing not found');
    res.json(listing);
  } catch (err) { next(err); }
}

async function getAvailableSlots(req, res, next) {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });

    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: { serviceConfig: true },
    });
    if (!listing || listing.type !== 'service') throw notFound('Service listing not found');

    const config = listing.serviceConfig;
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (!config.workingDays.includes(dayOfWeek)) {
      return res.json({ slots: [], message: 'Provider not available on this day' });
    }

    const existingBookings = await prisma.booking.findMany({
      where: { listingId: listing.id, slotDate: new Date(date), status: { in: ['pending', 'confirmed'] } },
      select: { slotStart: true, slotEnd: true },
    });

    const slots = generateSlots({
      workingHoursStart: config.workingHoursStart,
      workingHoursEnd: config.workingHoursEnd,
      slotDurationMins: config.slotDurationMins,
      bufferMins: config.bufferMins,
      existingBookings: existingBookings.map(b => ({ start: b.slotStart, end: b.slotEnd })),
    });

    res.json({ slots, date });
  } catch (err) { next(err); }
}

async function createListing(req, res, next) {
  try {
    const { title, description, type, category, condition, pricingModel, fixedPrice, moq, stockQty, fulfillment, visibility, slabs, serviceConfig } = req.body;

    const photoUrls = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const url = await storage.upload(file.buffer, `listings/${req.user.id}_${Date.now()}_${file.originalname}`, file.mimetype);
        photoUrls.push(url);
      }
    }

    const listing = await prisma.listing.create({
      data: {
        sellerId: req.user.id,
        communityId: req.user.communityId,
        title, description, type, category,
        condition: type === 'product' ? condition : null,
        pricingModel, fixedPrice: fixedPrice ? parseFloat(fixedPrice) : null,
        moq: moq ? parseInt(moq) : null,
        stockQty: stockQty ? parseInt(stockQty) : null,
        photos: photoUrls,
        fulfillment: fulfillment ? JSON.parse(fulfillment) : {},
        visibility: visibility || 'everyone',
        status: 'active',
      },
    });

    if (pricingModel === 'slab' && slabs) {
      const slabData = JSON.parse(slabs);
      await prisma.priceSlab.createMany({
        data: slabData.map((s, i) => ({ listingId: listing.id, fromQty: s.fromQty, toQty: s.toQty || null, pricePerUnit: s.pricePerUnit, position: i })),
      });
    }

    if (type === 'service' && serviceConfig) {
      const sc = JSON.parse(serviceConfig);
      await prisma.serviceConfig.create({
        data: { listingId: listing.id, slotDurationMins: sc.slotDurationMins, bufferMins: sc.bufferMins, workingDays: sc.workingDays, workingHoursStart: sc.workingHoursStart, workingHoursEnd: sc.workingHoursEnd, maxConcurrent: sc.maxConcurrent || 1, serviceAreaKm: sc.serviceAreaKm },
      });
    }

    res.status(201).json(listing);
  } catch (err) { next(err); }
}

async function updateListing(req, res, next) {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) throw notFound('Listing not found');
    if (listing.sellerId !== req.user.id) throw forbidden('Not your listing');
    const updated = await prisma.listing.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (err) { next(err); }
}

async function deleteListing(req, res, next) {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) throw notFound('Listing not found');
    if (listing.sellerId !== req.user.id) throw forbidden('Not your listing');
    await prisma.listing.update({ where: { id: req.params.id }, data: { status: 'removed' } });
    res.json({ success: true });
  } catch (err) { next(err); }
}

async function reportListing(req, res, next) {
  try {
    const { reason, description } = req.body;
    await prisma.report.create({
      data: { reporterId: req.user.id, listingId: req.params.id, reason, description, status: 'open' },
    });

    // Auto-hide after 3 reports
    const count = await prisma.report.count({ where: { listingId: req.params.id, status: 'open' } });
    if (count >= 3) {
      await prisma.listing.update({ where: { id: req.params.id }, data: { status: 'pending_review' } });
    }

    res.json({ success: true });
  } catch (err) { next(err); }
}

module.exports = { searchListings, getListing, getAvailableSlots, createListing, updateListing, deleteListing, reportListing };
