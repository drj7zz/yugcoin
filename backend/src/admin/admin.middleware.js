const User = require('../models/User');

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('role');
    if (!user || user.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Administrator access is required.' });
    req.admin = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Unable to verify administrator access.' });
  }
}

module.exports = { requireAdmin };
