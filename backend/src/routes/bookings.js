const router = require('express').Router();
const { requireAuth, requireVerified } = require('../middleware/auth');
const c = require('../controllers/bookings');

router.post('/', requireAuth, requireVerified, c.createBooking);
router.get('/', requireAuth, requireVerified, c.listBookings);
router.get('/:id', requireAuth, requireVerified, c.getBooking);
router.patch('/:id/confirm', requireAuth, requireVerified, c.confirmBooking);
router.patch('/:id/decline', requireAuth, requireVerified, c.declineBooking);
router.patch('/:id/reschedule', requireAuth, requireVerified, c.rescheduleBooking);
router.patch('/:id/cancel', requireAuth, requireVerified, c.cancelBooking);
router.post('/:id/close', requireAuth, requireVerified, c.closeBooking);
router.post('/:id/dispute', requireAuth, requireVerified, c.disputeBooking);

module.exports = router;
