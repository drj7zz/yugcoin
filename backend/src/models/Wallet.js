const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  uid: {
    type: String,
    unique: true,
    required: true,
    immutable: true,
    default: () => {
      const numericPart = String(Math.floor(100000 + (Math.random() * 900000)));
      return `YUG-${numericPart}`;
    }
  },
  userId: { type: mongoose.Schema.Types.Mixed, required: true }, // User ObjectId or 'SYSTEM_RESERVE' / 'FEE_POOL'
  walletAddress: { type: String, required: true },
  accountType: { type: String, enum: ['USER', 'SYSTEM_RESERVE', 'FEE_POOL'], default: 'USER' },
  currency: { type: String, enum: ['YUG', 'USD'], default: 'YUG' },
  balance: { type: Number, default: 0, min: 0 },
  lockedBalance: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['ACTIVE', 'FROZEN'], default: 'ACTIVE' },
  updatedAt: { type: Date, default: Date.now }
});

walletSchema.index({ userId: 1, currency: 1 }, { unique: true });

module.exports = mongoose.model('Wallet', walletSchema);
