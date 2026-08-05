const walletEngine = require('../services/walletEngine.service');
const { verifyPin } = require('./auth.controller');

exports.getWallets = async (req, res) => {
  try {
    const userId = req.user.id;
    const wallets = await walletEngine.getUserWallets(userId);
    res.json({ success: true, wallets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.transfer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { destinationAddress, amount, currency, securityPin, idempotencyKey, description } = req.body;

    if (!destinationAddress || !amount || !securityPin) {
      return res.status(400).json({ success: false, error: 'Missing required parameters (destinationAddress, amount, securityPin)' });
    }

    // Security PIN Verification
    const isPinValid = await verifyPin(req, userId, securityPin);
    if (!isPinValid) {
      return res.status(401).json({ success: false, error: 'Invalid Security PIN. Transaction rejected.' });
    }

    // Execute Wallet Engine Atomic Transfer
    const result = await walletEngine.processTransfer({
      sourceUserId: userId,
      destinationAddress,
      amount: parseFloat(amount),
      currency: currency || 'YUG',
      idempotencyKey: idempotencyKey || req.headers['x-idempotency-key'],
      description
    });

    // Emit Socket.io real-time updates if io instance is attached
    const io = req.app.get('io');
    if (io) {
      io.emit('wallet_update', {
        type: 'TRANSFER_COMPLETED',
        sourceAddress: req.user.walletAddress,
        destinationAddress: result.transaction.destinationAddress,
        destinationUsername: result.transaction.destinationUsername,
        amount,
        currency: currency || 'YUG',
        txId: result.transaction.transactionId
      });
    }

    res.json({
      success: true,
      message: 'Transfer processed successfully',
      transaction: result.transaction,
      idempotent: !!result.idempotent
    });
  } catch (error) {
    console.error('[Transfer Error]', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deposit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, currency, idempotencyKey } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
    }

    const result = await walletEngine.processDeposit({
      userId,
      amount: parseFloat(amount),
      currency: currency || 'YUG',
      idempotencyKey: idempotencyKey || req.headers['x-idempotency-key']
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('wallet_update', {
        type: 'DEPOSIT_COMPLETED',
        walletAddress: req.user.walletAddress,
        amount,
        currency: currency || 'YUG'
      });
    }

    res.json({
      success: true,
      message: 'Deposit successful',
      transaction: result.transaction
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const walletAddress = req.user.walletAddress;
    const history = await walletEngine.getTransactionHistory(walletAddress);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLedgerAudit = async (req, res) => {
  try {
    const auditResults = await walletEngine.verifyLedgerIntegrity();
    res.json({ success: true, audit: auditResults });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
