const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');
const adminRoutes = require('./admin/admin.routes');
const seedData = require('./seed');

const app = express();
const server = http.createServer(app);

// Socket.io for Realtime Wallet Notifications
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

// Rate limiter for financial endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'YugCoin Wallet Engine',
    timestamp: new Date()
  });
});

// Socket Connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('join_wallet', (walletAddress) => {
    if (walletAddress) {
      socket.join(walletAddress);
      console.log(`[Socket.io] Client ${socket.id} joined room ${walletAddress}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  await seedData();

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 YugCoin Wallet Engine Backend Server running on port ${PORT}`);
    console.log(`⚡ Real-time Socket.io active`);
    console.log(`🔒 Double-Entry Cryptographic Ledger Engine Ready`);
    console.log(`=======================================================`);
  });
}

startServer();
