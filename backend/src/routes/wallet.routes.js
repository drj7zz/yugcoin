const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/balances', walletController.getWallets);
router.post('/transfer', walletController.transfer);
router.get('/history', walletController.getHistory);
router.get('/audit', walletController.getLedgerAudit);

module.exports = router;
