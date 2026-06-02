const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/db');

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Requires Aadhaar to be approved before accessing most routes
async function requireVerified(req, res, next) {
  if (req.user.aadhaarStatus !== 'approved') {
    return res.status(403).json({ error: 'Aadhaar verification required', code: 'AADHAAR_PENDING' });
  }
  next();
}

module.exports = { requireAuth, requireVerified };
