const prisma = require('../config/db');

/**
 * Query all enabled delivery partners for a given route.
 * Each partner adapter returns: { partnerName, vehicleType, etaMins, price, currency }
 * If a partner API is unavailable, it is silently skipped.
 */
async function queryPartners({ sellerLat, sellerLng, buyerLat, buyerLng }) {
  const partners = await prisma.deliveryPartner.findMany({ where: { enabled: true } });
  const results = [];

  for (const partner of partners) {
    try {
      const adapter = loadAdapter(partner.slug);
      if (!adapter) continue;
      const quote = await adapter.getQuote({ sellerLat, sellerLng, buyerLat, buyerLng, apiKey: process.env[partner.apiKeyEnvVar] });
      if (quote) results.push({ ...quote, partnerName: partner.name, partnerId: partner.id });
    } catch {
      // Partner unavailable — skip silently
    }
  }

  return results;
}

function loadAdapter(slug) {
  const adapters = {
    porter: require('./delivery/porterAdapter'),
    dunzo: require('./delivery/dunzoAdapter'),
    rapido: require('./delivery/rapidoAdapter'),
    swiggy_genie: require('./delivery/swiggyGenieAdapter'),
  };
  return adapters[slug] || null;
}

module.exports = { queryPartners };
