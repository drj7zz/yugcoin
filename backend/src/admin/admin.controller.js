const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Coupon = require('../models/Coupon');
const Transaction = require('../models/Transaction');

const cleanUser = (user, wallets = []) => ({ id: user._id, name: user.name, email: user.email, username: user.username, walletAddress: user.walletAddress, role: user.role, createdAt: user.createdAt, wallets });

exports.getOverview = async (req, res) => {
  const [users, activeCoupons, wallets, balance] = await Promise.all([User.countDocuments(), Coupon.countDocuments({ status: 'ACTIVE' }), Wallet.countDocuments({ accountType: 'USER', currency: 'YUG' }), Wallet.aggregate([{ $match: { accountType: 'USER', currency: 'YUG' } }, { $group: { _id: null, total: { $sum: '$balance' } } }])]);
  res.json({ success: true, overview: { users, wallets, activeCoupons, yugInWallets: balance[0]?.total || 0 } });
};

exports.listTransactions = async (req, res) => {
  const transactions = await Transaction.find({ currency: 'YUG' }).sort({ createdAt: -1 }).limit(100).lean();
  const addresses = [...new Set(transactions.flatMap((item) => [item.sourceAddress, item.destinationAddress]))];
  const users = await User.find({ walletAddress: { $in: addresses } }).select('walletAddress name username').lean();
  const identities = new Map(users.map((user) => [user.walletAddress, user]));
  res.json({ success: true, transactions: transactions.map((item) => ({ ...item, sourceName: item.sourceName || identities.get(item.sourceAddress)?.name || item.sourceAddress, destinationName: item.destinationName || identities.get(item.destinationAddress)?.name || item.destinationAddress, sourceUsername: item.sourceUsername || identities.get(item.sourceAddress)?.username || '', destinationUsername: item.destinationUsername || identities.get(item.destinationAddress)?.username || '' })) });
};

exports.listUsers = async (req, res) => {
  const users = await User.find().select('-password -securityPin').sort({ createdAt: -1 }).limit(250).lean();
  const wallets = await Wallet.find({ userId: { $in: users.map((user) => user._id) } }).lean();
  const grouped = wallets.reduce((result, wallet) => ({ ...result, [String(wallet.userId)]: [...(result[String(wallet.userId)] || []), wallet] }), {});
  res.json({ success: true, users: users.map((user) => cleanUser(user, grouped[String(user._id)] || [])) });
};

exports.updateUser = async (req, res) => {
  const allowed = ['name', 'email', 'role'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  if (updates.email) updates.email = String(updates.email).trim().toLowerCase();
  if (updates.role && !['USER', 'ADMIN'].includes(updates.role)) return res.status(400).json({ success: false, error: 'Invalid role.' });
  if (String(req.user.id) === req.params.userId && updates.role === 'USER') return res.status(400).json({ success: false, error: 'You cannot remove your own administrator access.' });
  const user = await User.findByIdAndUpdate(req.params.userId, updates, { new: true, runValidators: true }).select('-password -securityPin');
  if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
  res.json({ success: true, user: cleanUser(user) });
};

exports.updateWallet = async (req, res) => {
  const { status } = req.body;
  if (!['ACTIVE', 'FROZEN'].includes(status)) return res.status(400).json({ success: false, error: 'Wallet status must be ACTIVE or FROZEN.' });
  const wallet = await Wallet.findByIdAndUpdate(req.params.walletId, { status, updatedAt: new Date() }, { new: true });
  if (!wallet || wallet.accountType !== 'USER') return res.status(404).json({ success: false, error: 'User wallet not found.' });
  res.json({ success: true, wallet });
};

exports.listCoupons = async (req, res) => res.json({ success: true, coupons: await Coupon.find().sort({ createdAt: -1 }).lean() });
exports.createCoupon = async (req, res) => {
  const { code, valueAmount, description, expiresAt } = req.body;
  if (!/^[A-Z0-9-]{4,40}$/.test(String(code || '').toUpperCase()) || !(Number(valueAmount) > 0)) return res.status(400).json({ success: false, error: 'Use a valid coupon code and positive NPR value.' });
  const coupon = await Coupon.create({ code: String(code).toUpperCase(), valueAmount: Number(valueAmount), description, expiresAt: expiresAt || null, createdBy: req.admin._id });
  res.status(201).json({ success: true, coupon });
};
exports.updateCoupon = async (req, res) => {
  const allowed = ['description', 'expiresAt', 'status', 'valueAmount'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  updates.updatedAt = new Date();
  const coupon = await Coupon.findByIdAndUpdate(req.params.couponId, updates, { new: true, runValidators: true });
  if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found.' });
  res.json({ success: true, coupon });
};
exports.deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.couponId);
  if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found.' });
  res.json({ success: true });
};
