const { queryPartners } = require('../services/deliveryService');

async function queryDeliveryPartners(req, res, next) {
  try {
    const { sellerLat, sellerLng, buyerLat, buyerLng } = req.body;
    if (!sellerLat || !sellerLng || !buyerLat || !buyerLng) {
      return res.status(400).json({ error: 'sellerLat, sellerLng, buyerLat, buyerLng are required' });
    }
    const options = await queryPartners({ sellerLat, sellerLng, buyerLat, buyerLng });
    res.json({ options, available: options.length > 0 });
  } catch (err) { next(err); }
}

module.exports = { queryDeliveryPartners };
