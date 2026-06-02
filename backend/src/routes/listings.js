const router = require('express').Router();
const multer = require('multer');
const { requireAuth, requireVerified } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const c = require('../controllers/listings');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', c.searchListings);
router.get('/:id', c.getListing);
router.get('/:id/slots', requireAuth, requireVerified, c.getAvailableSlots);
router.post('/', requireAuth, requireVerified, uploadLimiter, upload.array('photos', 10), c.createListing);
router.patch('/:id', requireAuth, requireVerified, upload.array('photos', 10), c.updateListing);
router.delete('/:id', requireAuth, requireVerified, c.deleteListing);
router.post('/:id/report', requireAuth, requireVerified, c.reportListing);

module.exports = router;
