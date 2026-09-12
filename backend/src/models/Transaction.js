const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  idempotencyKey: { type: String, required: true, unique: true },
  sourceWalletId: { type: mongoose.Schema.Types.Mixed, required: true },
  destinationWalletId: { type: mongoose.Schema.Types.Mixed, required: true },
  sourceAddress: { type: String, required: true },
  destinationAddress: { type: String, required: true },
  sourceUsername: { type: String, default: '' },
  destinationUsername: { type: String, default: '' },
  sourceName: { type: String, default: '' },
  destinationName: { type: String, default: '' },
  amount: { type: Number, required: true, min: 0.0001 },
  fee: { type: Number, default: 0 },
  currency: { type: String, required: true, enum: ['YUG', 'USD'] },
  type: { type: String, required: true, enum: ['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'REWARD', 'SYSTEM_INITIALIZATION'] },
  status: { type: String, required: true, enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'], default: 'PENDING' },
  description: { type: String, default: '' },
  failureReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
