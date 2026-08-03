const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const walletEngine = require('../services/walletEngine.service');
const { JWT_SECRET } = require('../middleware/auth.middleware');
const { generateWalletUid } = require('../utils/walletUid');

function validateSecurityPin(pin) {
  if (!pin || !/^[0-9]{4}$/.test(String(pin))) {
    return false;
  }
  return true;
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, securityPin } = req.body;
    if (!name || !email || !password || !validateSecurityPin(securityPin)) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields (name, email, password, securityPin). PIN must be exactly 4 digits.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedPin = await bcrypt.hash(securityPin.toString(), salt);
    
    // Generate readable unique wallet address e.g. YUG-8F3A92
    const shortHash = cryptoRandomString(6);
    const walletAddress = `YUG-${shortHash}`;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      securityPin: hashedPin,
      walletAddress,
      role: 'USER'
    });
    
    const userId = newUser._id;

    const yugUid = generateWalletUid();
    const usdUid = generateWalletUid();

    await Wallet.create([
      { uid: yugUid, userId, walletAddress, accountType: 'USER', currency: 'YUG', balance: 500 },
      { uid: usdUid, userId, walletAddress, accountType: 'USER', currency: 'USD', balance: 100 }
    ]);

    const token = jwt.sign({ id: userId, email: email.toLowerCase(), name, walletAddress, role: 'USER' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully with bonus balances!',
      token,
      user: { id: userId, name, email, walletAddress, role: 'USER' }
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    const userId = user._id || user.id;
    const token = jwt.sign({ id: userId, email: user.email, name: user.name, walletAddress: user.walletAddress, role: user.role || 'USER' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role || 'USER'
      }
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password -securityPin');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const wallets = await walletEngine.getUserWallets(userId);

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt
      },
      wallets
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyPin = async (req, userId, pin) => {
  const user = await User.findById(userId);
  if (!user) return false;
  return await bcrypt.compare(pin.toString(), user.securityPin);
};

function cryptoRandomString(length) {
  const chars = '0123456789ABCDEF';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
