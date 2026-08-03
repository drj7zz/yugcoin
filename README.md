# YugCoin Wallet Engine

YugCoin is a financial-grade MERN stack (MongoDB, Express, React, Node.js) wallet application. It features a robust double-entry ledger engine to guarantee transactional integrity, alongside a modern, clean, and responsive frontend.

## Key Features

- **Double-Entry Ledger:** Built-in cryptographic integrity checks to ensure financial invariants.
- **MongoDB Native:** Strictly reliant on atomic MongoDB transactions for secure balance transfers and deposits (no mock or in-memory stores).
- **Real-Time Updates:** WebSockets (Socket.io) integrated for real-time transaction history and wallet updates.
- **Clean UI:** Responsive, aesthetically pleasing design focusing on authentic colors and micro-interactions without excessive visual noise.
- **Production Ready:** Removed all demo accounts and placeholder endpoints. Fully configured to connect seamlessly using relative paths and proxy setups.

## Prerequisites

- Node.js (v18+)
- MongoDB Atlas Cluster (or a local MongoDB instance)

## Environment Setup

### Backend
1. Navigate to the `backend` directory.
2. Create or configure your `.env` file in `backend/.env`.
3. Add your MongoDB URI and a JWT secret:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=yugcoin
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Running Locally (Development)

Start the backend (runs on port 5000 by default):
```bash
cd backend
npm start
```

Start the frontend Vite dev server (runs on port 3000 by default):
```bash
cd frontend
npm run dev
```

## Building for Production

To prepare the frontend for production deployment:
```bash
cd frontend
npm run build
```
This generates a `dist` folder containing the compiled static assets. You can serve this `dist` folder via Nginx, Apache, or configure your Node.js backend to serve it statically. 

The application uses relative paths (`/api`) to automatically resolve to your backend API, removing the need for hardcoded placeholder domains.
