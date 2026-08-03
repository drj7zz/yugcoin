const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const LedgerEntry = require('../models/LedgerEntry');

// Compute SHA-256 hash for ledger cryptographic chain
function calculateEntryHash(prevHash, entryId, transactionId, walletId, type, amount, balanceAfter, timestamp) {
  const data = `${prevHash}|${entryId}|${transactionId}|${walletId}|${type}|${amount}|${balanceAfter}|${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Get latest hash in the global ledger chain
async function getLastLedgerHash() {
  const lastEntry = await LedgerEntry.findOne().sort({ timestamp: -1, _id: -1 });
  return lastEntry ? lastEntry.entryHash : '0000000000000000000000000000000000000000000000000000000000000000';
}

class WalletEngineService {

  normalizeUserIdVariants(userId) {
    const values = new Set();

    if (userId === undefined || userId === null || userId === '') {
      return [];
    }

    values.add(userId);

    if (typeof userId === 'string') {
      const trimmed = userId.trim();
      if (trimmed) {
        values.add(trimmed);
        try {
          const objId = new mongoose.Types.ObjectId(trimmed);
          values.add(objId.toString());
          values.add(objId);
        } catch (err) {
          // ignore invalid ObjectId values; keep original string lookup
        }
      }
    }

    if (userId instanceof mongoose.Types.ObjectId) {
      values.add(userId.toString());
      values.add(userId);
    }

    return Array.from(values).filter(Boolean);
  }

  // Check if mongo is active
  isMongoActive() {
    return mongoose.connection.readyState === 1;
  }

  // Find system or fee wallet
  async getSystemWallet(accountType, currency = 'YUG') {
    let wallet = await Wallet.findOne({ accountType, currency });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: accountType,
        walletAddress: accountType === 'SYSTEM_RESERVE' ? `SYS-RESERVE-${currency}` : `SYS-FEEPOOL-${currency}`,
        accountType,
        currency,
        balance: accountType === 'SYSTEM_RESERVE' ? 10000000 : 0,
        lockedBalance: 0,
        status: 'ACTIVE'
      });
    }
    return wallet;
  }

  /**
   * Process Double-Entry Wallet Transfer
   */
  async processTransfer({ sourceUserId, destinationAddress, amount, currency = 'YUG', idempotencyKey, description = '' }) {
    if (!amount || amount <= 0) {
      throw new Error('Transfer amount must be greater than 0');
    }

    // 1. Idempotency Check
    if (idempotencyKey) {
      let existingTx = await Transaction.findOne({ idempotencyKey });
      if (existingTx) {
        console.log(`[WalletEngine] Idempotency match for key ${idempotencyKey}`);
        return { transaction: existingTx, idempotent: true };
      }
    }

    const txId = 'TX-' + uuidv4().substring(0, 8).toUpperCase();
    const effectiveKey = idempotencyKey || txId;
    const feeRate = 0.001; // 0.1% fee
    const fee = Math.round(amount * feeRate * 10000) / 10000;
    const totalDeduction = amount + fee;

    // MongoDB Transaction Execution with Atomic Session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const sourceWallet = await Wallet.findOne({
        userId: { $in: this.normalizeUserIdVariants(sourceUserId) },
        currency
      }).session(session);
      if (!sourceWallet) throw new Error(`Sender wallet not found for currency ${currency}`);
      if (sourceWallet.status !== 'ACTIVE') throw new Error('Sender wallet is frozen or inactive');
      if (sourceWallet.balance < totalDeduction) {
        throw new Error(`Insufficient funds. Required: ${totalDeduction} ${currency}, Available: ${sourceWallet.balance}`);
      }

      const destWallet = await Wallet.findOne({ walletAddress: destinationAddress, currency }).session(session);
      if (!destWallet) throw new Error(`Recipient wallet address '${destinationAddress}' not found for currency ${currency}`);
      if (destWallet._id.toString() === sourceWallet._id.toString()) throw new Error('Cannot transfer to your own wallet');

      const feeWallet = await Wallet.findOne({ accountType: 'FEE_POOL', currency }).session(session);

      // Update balances
      sourceWallet.balance -= totalDeduction;
      sourceWallet.updatedAt = new Date();
      await sourceWallet.save({ session });

      destWallet.balance += amount;
      destWallet.updatedAt = new Date();
      await destWallet.save({ session });

      if (fee > 0 && feeWallet) {
        feeWallet.balance += fee;
        feeWallet.updatedAt = new Date();
        await feeWallet.save({ session });
      }

      // Create transaction document
      const transactionRecord = new Transaction({
        transactionId: txId,
        idempotencyKey: effectiveKey,
        sourceWalletId: sourceWallet._id,
        destinationWalletId: destWallet._id,
        sourceAddress: sourceWallet.walletAddress,
        destinationAddress: destWallet.walletAddress,
        amount,
        fee,
        currency,
        type: 'TRANSFER',
        status: 'COMPLETED',
        description: description || `Transfer to ${destinationAddress}`
      });
      await transactionRecord.save({ session });

      let prevHash = await getLastLedgerHash();
      const timestamp = new Date();

      // Ledger DEBIT
      const debitId = 'LED-' + uuidv4().substring(0, 8);
      const debitHash = calculateEntryHash(prevHash, debitId, txId, sourceWallet._id.toString(), 'DEBIT', totalDeduction, sourceWallet.balance, timestamp.toISOString());
      const debitEntry = new LedgerEntry({
        entryId: debitId,
        transactionId: txId,
        walletId: sourceWallet._id,
        walletAddress: sourceWallet.walletAddress,
        type: 'DEBIT',
        amount: totalDeduction,
        currency,
        balanceAfter: sourceWallet.balance,
        prevHash,
        entryHash: debitHash,
        timestamp
      });
      await debitEntry.save({ session });
      prevHash = debitHash;

      // Ledger CREDIT
      const creditId = 'LED-' + uuidv4().substring(0, 8);
      const creditHash = calculateEntryHash(prevHash, creditId, txId, destWallet._id.toString(), 'CREDIT', amount, destWallet.balance, timestamp.toISOString());
      const creditEntry = new LedgerEntry({
        entryId: creditId,
        transactionId: txId,
        walletId: destWallet._id,
        walletAddress: destWallet.walletAddress,
        type: 'CREDIT',
        amount,
        currency,
        balanceAfter: destWallet.balance,
        prevHash,
        entryHash: creditHash,
        timestamp
      });
      await creditEntry.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { transaction: transactionRecord, sourceWallet, destWallet };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  /**
   * Process Faucet Deposit / Top-up
   */
  async processDeposit({ userId, amount, currency = 'YUG', idempotencyKey }) {
    if (!amount || amount <= 0) throw new Error('Deposit amount must be positive');

    const txId = 'DEP-' + uuidv4().substring(0, 8).toUpperCase();
    const effectiveKey = idempotencyKey || txId;

    const wallet = await Wallet.findOne({
      userId: { $in: this.normalizeUserIdVariants(userId) },
      currency
    });
    if (!wallet) throw new Error('Wallet not found');
    const systemReserve = await this.getSystemWallet('SYSTEM_RESERVE', currency);

    wallet.balance += amount;
    await wallet.save();

    const txRecord = new Transaction({
      transactionId: txId,
      idempotencyKey: effectiveKey,
      sourceWalletId: systemReserve._id,
      destinationWalletId: wallet._id,
      sourceAddress: systemReserve.walletAddress,
      destinationAddress: wallet.walletAddress,
      amount,
      fee: 0,
      currency,
      type: 'DEPOSIT',
      status: 'COMPLETED',
      description: 'Wallet Deposit / Top-Up'
    });
    await txRecord.save();

    let prevHash = await getLastLedgerHash();
    const timestamp = new Date();
    const creditId = 'LED-' + uuidv4().substring(0, 8);
    const creditHash = calculateEntryHash(prevHash, creditId, txId, wallet._id.toString(), 'CREDIT', amount, wallet.balance, timestamp.toISOString());

    await LedgerEntry.create({
      entryId: creditId,
      transactionId: txId,
      walletId: wallet._id,
      walletAddress: wallet.walletAddress,
      type: 'CREDIT',
      amount,
      currency,
      balanceAfter: wallet.balance,
      prevHash,
      entryHash: creditHash,
      timestamp
    });

    return { transaction: txRecord, wallet };
  }

  /**
   * Ledger Audit & Chain Integrity Verifier
   */
  async verifyLedgerIntegrity() {
    const entries = await LedgerEntry.find().sort({ timestamp: 1, _id: 1 }).lean();

    let previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
    let isValid = true;
    const auditLogs = [];
    let debitsTotal = 0;
    let creditsTotal = 0;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.type === 'DEBIT') debitsTotal += entry.amount;
      if (entry.type === 'CREDIT') creditsTotal += entry.amount;

      const expectedHash = calculateEntryHash(
        entry.prevHash,
        entry.entryId,
        entry.transactionId,
        entry.walletId.toString(),
        entry.type,
        entry.amount,
        entry.balanceAfter,
        new Date(entry.timestamp).toISOString()
      );

      const isHashValid = (entry.entryHash === expectedHash) && (entry.prevHash === previousHash);

      if (!isHashValid) {
        isValid = false;
        auditLogs.push(`[CORRUPTED ENTRY] EntryId ${entry.entryId} hash mismatch at index ${i}`);
      }

      previousHash = entry.entryHash;
    }

    return {
      totalEntries: entries.length,
      isChainValid: isValid,
      debitsTotal: Math.round(debitsTotal * 100) / 100,
      creditsTotal: Math.round(creditsTotal * 100) / 100,
      balanced: Math.abs(debitsTotal - creditsTotal) < 0.01,
      latestHash: previousHash,
      auditLogs
    };
  }

  // Get User Wallets
  async getUserWallets(userId) {
    const userIdVariants = this.normalizeUserIdVariants(userId);
    if (!userIdVariants.length) {
      return [];
    }
    return await Wallet.find({ userId: { $in: userIdVariants } });
  }

  // Get Transactions History
  async getTransactionHistory(walletAddress) {
    return await Transaction.find({
      $or: [{ sourceAddress: walletAddress }, { destinationAddress: walletAddress }]
    }).sort({ createdAt: -1 });
  }
}

module.exports = new WalletEngineService();
