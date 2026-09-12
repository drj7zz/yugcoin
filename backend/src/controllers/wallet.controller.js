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

async function createTransfer(req, res) {
  try {
    const userId = req.user.id;
    const { destinationAddress, amount, currency, securityPin, idempotencyKey, description } = req.body;

    const numericAmount = Number(amount);
    const normalizedCurrency = String(currency || 'YUG').trim().toUpperCase();

    if (!destinationAddress || amount === undefined || !securityPin) {
      return res.status(400).json({ success: false, error: 'Missing required parameters (destinationAddress, amount, securityPin)' });
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: 'amount must be a positive number' });
    }
    if (!['YUG', 'USD'].includes(normalizedCurrency)) {
      return res.status(400).json({ success: false, error: 'currency must be YUG or USD' });
    }
    if (description !== undefined && (typeof description !== 'string' || description.length > 500)) {
      return res.status(400).json({ success: false, error: 'description must be a string of at most 500 characters' });
    }

    // Security PIN Verification
    const isPinValid = await verifyPin(req, userId, securityPin);
    if (!isPinValid) {
      return res.status(401).json({ success: false, error: 'Invalid Security PIN. Transaction rejected.' });
    }

    // Execute Wallet Engine Atomic Transfer
    const result = await walletEngine.processTransfer({
      sourceUserId: userId,
      destinationAddress: String(destinationAddress).trim(),
      amount: numericAmount,
      currency: normalizedCurrency,
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
        amount: numericAmount,
        currency: normalizedCurrency,
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
}

// Kept for existing dashboard clients.
exports.transfer = createTransfer;

// RESTful marketplace alias. A transaction is always paid by the authenticated wallet.
exports.createTransaction = createTransfer;

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

exports.getTransaction = async (req, res) => {
  try {
    const transaction = await walletEngine.getTransactionForWallet(
      req.user.walletAddress,
      req.params.transactionId
    );

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    res.json({ success: true, transaction });
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
