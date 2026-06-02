async function getQuote({ sellerLat, sellerLng, buyerLat, buyerLng, apiKey }) {
  if (!apiKey || apiKey === 'replace_when_available') return null;
  // TODO: implement Rapido API call
  return null;
}
module.exports = { getQuote };
