const router = require('express').Router();
const multer = require('multer');
const { requireAuth, requireVerified } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const c = require('../controllers/users');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/me/notifications', requireAuth, c.getNotifications);
router.patch('/me/notifications/:id/read', requireAuth, c.markNotificationRead);
router.patch('/me', requireAuth, c.updateProfile);
router.post('/me/aadhaar', requireAuth, uploadLimiter, upload.fields([
  { name: 'front', maxCount: 1 },
  { name: 'back', maxCount: 1 },
]), c.uploadAadhaar);
router.get('/:id', requireAuth, requireVerified, c.getPublicProfile);
router.post('/:id/vouch', requireAuth, requireVerified, c.vouchUser);
router.delete('/:id/vouch', requireAuth, requireVerified, c.revokeVouch);

module.exports = router;
