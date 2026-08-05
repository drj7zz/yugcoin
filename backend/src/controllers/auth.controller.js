const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const walletEngine = require('../services/walletEngine.service');
const { JWT_SECRET } = require('../middleware/auth.middleware');

function validateSecurityPin(pin) {
  if (!pin || !/^[0-9]{4}$/.test(String(pin))) {
    return false;
  }
  return true;
}

function validatePassword(password) {
  return typeof password === 'string'
    && password.length >= 8
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password);
}

function createToken(user) {
  return jwt.sign({ id: user._id || user.id, email: user.email, name: user.name, walletAddress: user.walletAddress, role: user.role || 'USER' }, JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  return { id: user._id || user.id, name: user.name, username: user.username || user.email.split('@')[0], email: user.email, walletAddress: user.walletAddress, role: user.role || 'USER' };
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, securityPin } = req.body;
    if (!name || !email || !password || !validateSecurityPin(securityPin)) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields (name, email, password, securityPin). PIN must be exactly 4 digits.' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters and include uppercase, lowercase, and a number.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Password confirmation does not match.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedPin = await bcrypt.hash(securityPin.toString(), salt);
    
    // Generate readable unique wallet address e.g. YUG-8F3A92
    const shortHash = cryptoRandomString(6);
    const walletAddress = `YUG-${shortHash}`;
    const username = `${String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'yug-user'}-${shortHash.toLowerCase()}`;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const newUser = await User.create({
      name,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      securityPin: hashedPin,
      walletAddress,
      role: 'USER'
    });
    
    const userId = newUser._id;

    const [yugWallet] = await Wallet.create([
      { userId, walletAddress, accountType: 'USER', currency: 'YUG', balance: 500 },
      { userId, walletAddress, accountType: 'USER', currency: 'USD', balance: 100 }
    ]);
    const reserveWallet = await walletEngine.getSystemWallet('SYSTEM_RESERVE', 'YUG');
    const Transaction = require('../models/Transaction');
    const initialTransaction = await Transaction.create({
      transactionId: `INIT-${cryptoRandomString(8)}`,
      idempotencyKey: `INITIAL-${userId}`,
      sourceWalletId: reserveWallet._id,
      destinationWalletId: yugWallet._id,
      sourceAddress: reserveWallet.walletAddress,
      destinationAddress: walletAddress,
      amount: 500,
      fee: 0,
      currency: 'YUG',
      type: 'SYSTEM_INITIALIZATION',
      status: 'COMPLETED',
      description: 'Initial demo YUG allocation'
    });

    const token = jwt.sign({ id: userId, email: email.toLowerCase(), name, walletAddress, role: 'USER' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully with bonus balances!',
      token,
      user: { id: userId, name, username, email, walletAddress, role: 'USER' },
      initialTransaction
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { credential, securityPin } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!credential || !clientId) {
      return res.status(400).json({ success: false, error: 'Google sign-in is not configured.' });
    }

    const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!googleResponse.ok) return res.status(401).json({ success: false, error: 'Google sign-in could not be verified.' });
    const profile = await googleResponse.json();
    if (profile.aud !== clientId || profile.email_verified !== 'true' || !['accounts.google.com', 'https://accounts.google.com'].includes(profile.iss)) {
      return res.status(401).json({ success: false, error: 'Google account verification failed.' });
    }

    const email = String(profile.email).toLowerCase();
    let user = await User.findOne({ $or: [{ googleSubject: profile.sub }, { email }] });
    let initialTransaction;

    if (!user) {
      if (!validateSecurityPin(securityPin)) {
        return res.status(400).json({ success: false, error: 'No YugCoin wallet was found for this Google account. Choose Create Wallet and enter a 4-digit transfer PIN to sign up.' });
      }
      const shortHash = cryptoRandomString(6);
      const walletAddress = `YUG-${shortHash}`;
      const username = `${String(profile.name || email.split('@')[0]).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'yug-user'}-${shortHash.toLowerCase()}`;
      const randomPassword = await bcrypt.hash(`${profile.sub}-${Date.now()}-${Math.random()}`, 10);
      const hashedPin = await bcrypt.hash(String(securityPin), 10);
      user = await User.create({ name: profile.name || email.split('@')[0], username, email, password: randomPassword, securityPin: hashedPin, walletAddress, role: 'USER', avatar: profile.picture || '', authProvider: 'GOOGLE', googleSubject: profile.sub });

      const [yugWallet] = await Wallet.create([{ userId: user._id, walletAddress, accountType: 'USER', currency: 'YUG', balance: 500 }, { userId: user._id, walletAddress, accountType: 'USER', currency: 'USD', balance: 100 }]);
      const reserveWallet = await walletEngine.getSystemWallet('SYSTEM_RESERVE', 'YUG');
      const Transaction = require('../models/Transaction');
      initialTransaction = await Transaction.create({ transactionId: `INIT-${cryptoRandomString(8)}`, idempotencyKey: `INITIAL-${user._id}`, sourceWalletId: reserveWallet._id, destinationWalletId: yugWallet._id, sourceAddress: reserveWallet.walletAddress, destinationAddress: walletAddress, amount: 500, fee: 0, currency: 'YUG', type: 'SYSTEM_INITIALIZATION', status: 'COMPLETED', description: 'Initial demo YUG allocation' });
    } else if (!user.googleSubject) {
      user.googleSubject = profile.sub;
      await user.save();
    }

    res.json({ success: true, token: createToken(user), user: publicUser(user), initialTransaction });
  } catch (error) {
    console.error('[Google Auth Error]', error);
    res.status(500).json({ success: false, error: 'Unable to complete Google sign-in.' });
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
        username: user.username || user.email.split('@')[0],
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
        username: user.username || user.email.split('@')[0],
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

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required.' });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ success: false, error: 'New password must be at least 8 characters.' });
    }

    const user = await User.findById(req.user.id);
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }
    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({ success: false, error: 'Choose a password that is different from your current password.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to update password.' });
  }
};

exports.changeSecurityPin = async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;
    if (!validateSecurityPin(newPin)) {
      return res.status(400).json({ success: false, error: 'New PIN must be exactly 4 digits.' });
    }

    const user = await User.findById(req.user.id);
    if (!user || !(await bcrypt.compare(String(currentPin || ''), user.securityPin))) {
      return res.status(401).json({ success: false, error: 'Current PIN is incorrect.' });
    }
    if (String(currentPin) === String(newPin)) {
      return res.status(400).json({ success: false, error: 'Choose a PIN that is different from your current PIN.' });
    }

    user.securityPin = await bcrypt.hash(String(newPin), 10);
    await user.save();
    res.json({ success: true, message: 'Security PIN updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to update security PIN.' });
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
