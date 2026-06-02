const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const c = require('../controllers/admin');

const guard = [requireAuth, adminOnly];

router.get('/aadhaar-queue', ...guard, c.getAadhaarQueue);
router.patch('/aadhaar/:userId/approve', ...guard, c.approveAadhaar);
router.patch('/aadhaar/:userId/reject', ...guard, c.rejectAadhaar);

router.get('/community-requests', ...guard, c.getCommunityRequests);
router.patch('/communities/:id/approve', ...guard, c.approveCommunity);
router.patch('/communities/:id/reject', ...guard, c.rejectCommunity);

router.get('/reports', ...guard, c.getReports);
router.patch('/reports/:id/action', ...guard, c.actionReport);

router.get('/users', ...guard, c.listUsers);
router.get('/users/:id', ...guard, c.getUser);
router.patch('/users/:id/action', ...guard, c.actionUser);

router.get('/listings', ...guard, c.listListings);
router.patch('/listings/:id/action', ...guard, c.actionListing);

router.get('/analytics', ...guard, c.getAnalytics);
router.get('/analytics/communities', ...guard, c.getCommunityAnalytics);
router.get('/analytics/group-buys', ...guard, c.getGroupBuyAnalytics);

router.get('/delivery-partners', ...guard, c.listDeliveryPartners);
router.post('/delivery-partners', ...guard, c.createDeliveryPartner);
router.patch('/delivery-partners/:id', ...guard, c.updateDeliveryPartner);

module.exports = router;
