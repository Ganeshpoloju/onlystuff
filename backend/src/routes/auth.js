const router = require('express').Router();
const passport = require('passport');
const { signToken, setTokenCookie } = require('../utils/jwt');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Initiate Google OAuth
router.get('/google', authLimiter, passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const token = signToken(req.user.id);
    setTokenCookie(res, token);
    // Redirect based on onboarding state
    if (req.user.aadhaarStatus === 'approved') {
      res.redirect(`${process.env.CLIENT_URL}/`);
    } else if (req.user.aadhaarStatus === 'pending' && !req.user.aadhaarFrontUrl) {
      res.redirect(`${process.env.CLIENT_URL}/onboarding/aadhaar`);
    } else {
      res.redirect(`${process.env.CLIENT_URL}/onboarding/pending`);
    }
  }
);

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Get current user — include community so the frontend can show the community name
router.get('/me', requireAuth, async (req, res) => {
  const prisma = require('../config/db');
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, email: true, name: true, avatarUrl: true,
      role: true, aadhaarStatus: true, aadhaarFrontUrl: true,
      communityId: true, phone: true,
      community: { select: { id: true, name: true, lat: true, lng: true } },
    },
  });
  res.json(user);
});

module.exports = router;
