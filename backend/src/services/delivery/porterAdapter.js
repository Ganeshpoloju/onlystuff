/**
 * Porter delivery adapter.
 * Replace stub with real Porter API call when credentials are available.
 */
async function getQuote({ sellerLat, sellerLng, buyerLat, buyerLng, apiKey }) {
  if (!apiKey || apiKey === 'replace_when_available') return null;
  // TODO: implement Porter API call
  // https://porter.in/docs/api
  return null;
}

module.exports = { getQuote };
