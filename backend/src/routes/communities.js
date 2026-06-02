const router = require('express').Router();
const { requireAuth, requireVerified } = require('../middleware/auth');
const c = require('../controllers/communities');

router.get('/', c.listCommunities);
router.get('/:id', c.getCommunity);
router.post('/request', requireAuth, c.requestCommunity);

module.exports = router;
