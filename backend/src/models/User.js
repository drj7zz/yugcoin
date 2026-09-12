const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, unique: true, sparse: true, immutable: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  securityPin: { type: String, required: true }, // Encrypted 4-digit PIN for confirming operations
  walletAddress: { type: String, required: true, unique: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  status: { type: String, enum: ['ACTIVE', 'DELETED'], default: 'ACTIVE' },
  avatar: { type: String, default: '' },
  authProvider: { type: String, enum: ['PASSWORD', 'GOOGLE'], default: 'PASSWORD' },
  googleSubject: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
