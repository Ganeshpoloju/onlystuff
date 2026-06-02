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

// Get current user
router.get('/me', requireAuth, (req, res) => {
  const { id, email, name, avatarUrl, role, aadhaarStatus, communityId, phone } = req.user;
  res.json({ id, email, name, avatarUrl, role, aadhaarStatus, communityId, phone });
});

module.exports = router;
