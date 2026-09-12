const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema({
  entryId: { type: String, required: true, unique: true },
  transactionId: { type: String, required: true },
  walletId: { type: mongoose.Schema.Types.Mixed, required: true },
  walletAddress: { type: String, required: true },
  type: { type: String, required: true, enum: ['DEBIT', 'CREDIT'] },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  balanceAfter: { type: Number, required: true },
  prevHash: { type: String, required: true },
  entryHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

ledgerEntrySchema.index({ transactionId: 1 });
ledgerEntrySchema.index({ walletId: 1 });

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
