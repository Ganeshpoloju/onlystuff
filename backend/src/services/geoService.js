const https = require('https');

/**
 * Geocode an address using Nominatim (OpenStreetMap) — free, no API key.
 * Rate limit: 1 req/second per Nominatim usage policy.
 */
function geocode(address) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(`${address}, Hyderabad, Telangana, India`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=in`;
    const options = {
      headers: { 'User-Agent': 'onlyStuff/1.0 (support@onlystuff.in)' },
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (!results.length) return resolve(null);
          resolve({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

/**
 * Find the nearest community to a given lat/lng.
 * Uses simple Haversine distance — no PostGIS needed.
 */
async function findNearestCommunity(prisma, lat, lng, radiusKm = 0.75) {
  const communities = await prisma.community.findMany({ where: { status: 'active' } });
  let nearest = null;
  let minDist = Infinity;
  for (const c of communities) {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < minDist && d <= radiusKm) { minDist = d; nearest = c; }
  }
  return nearest;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

module.exports = { geocode, findNearestCommunity, haversineKm };
