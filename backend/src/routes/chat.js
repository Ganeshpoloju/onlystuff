const router = require('express').Router();
const multer = require('multer');
const { requireAuth, requireVerified } = require('../middleware/auth');
const c = require('../controllers/chat');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', requireAuth, requireVerified, c.listConversations);
router.get('/:listingId', requireAuth, requireVerified, c.getMessages);
router.post('/:listingId', requireAuth, requireVerified, upload.array('images', 5), c.sendMessage);

module.exports = router;
