const router = require('express').Router();
const { requireAuth, requireVerified } = require('../middleware/auth');
const c = require('../controllers/delivery');

router.post('/query', requireAuth, requireVerified, c.queryDeliveryPartners);

module.exports = router;
