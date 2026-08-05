const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireAdmin } = require('./admin.middleware');
const admin = require('./admin.controller');

router.use(authMiddleware, requireAdmin);
router.get('/overview', admin.getOverview);
router.get('/users', admin.listUsers);
router.patch('/users/:userId', admin.updateUser);
router.patch('/wallets/:walletId', admin.updateWallet);
router.get('/coupons', admin.listCoupons);
router.post('/coupons', admin.createCoupon);
router.patch('/coupons/:couponId', admin.updateCoupon);
router.delete('/coupons/:couponId', admin.deleteCoupon);

module.exports = router;
