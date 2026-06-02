const router = require('express').Router();
const { requireAuth, requireVerified } = require('../middleware/auth');
const c = require('../controllers/orders');

router.post('/', requireAuth, requireVerified, c.placeOrder);
router.get('/', requireAuth, requireVerified, c.listOrders);
router.get('/:id', requireAuth, requireVerified, c.getOrder);
router.patch('/:id/confirm', requireAuth, requireVerified, c.confirmOrder);
router.patch('/:id/close', requireAuth, requireVerified, c.closeOrder);
router.post('/:id/dispute', requireAuth, requireVerified, c.disputeOrder);
router.get('/:id/reviews', requireAuth, requireVerified, c.getReviews);
router.post('/:id/reviews', requireAuth, requireVerified, c.postReview);

module.exports = router;
