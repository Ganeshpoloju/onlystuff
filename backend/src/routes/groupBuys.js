const router = require('express').Router();
const { requireAuth, requireVerified } = require('../middleware/auth');
const c = require('../controllers/groupBuys');

router.get('/', requireAuth, requireVerified, c.listGroupBuys);
router.post('/', requireAuth, requireVerified, c.initiateGroupBuy);
router.get('/:id', requireAuth, requireVerified, c.getGroupBuy);
router.post('/:id/join', requireAuth, requireVerified, c.joinGroupBuy);
router.post('/:id/extend', requireAuth, requireVerified, c.extendGroupBuy);
router.get('/:id/chat', requireAuth, requireVerified, c.getGroupBuyChat);
router.post('/:id/chat', requireAuth, requireVerified, c.sendGroupBuyMessage);

module.exports = router;
