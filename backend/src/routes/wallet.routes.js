const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/balances', walletController.getWallets);
router.post('/transfer', walletController.transfer);
router.get('/history', walletController.getHistory);
// Marketplace-friendly REST endpoints. They share the same atomic wallet engine
// as the legacy dashboard routes above.
router.post('/transactions', walletController.createTransaction);
router.get('/transactions', walletController.getHistory);
router.get('/transactions/:transactionId', walletController.getTransaction);
router.get('/audit', walletController.getLedgerAudit);

module.exports = router;
