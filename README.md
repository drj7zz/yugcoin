# YugCoin

YugCoin is a React, Express, and MongoDB digital-wallet application. It provides authenticated wallets, deposits, transfers, transaction history, Socket.io updates, and a double-entry ledger with an integrity audit.

## Live app

https://yugcoin-frontend.onrender.com

## Features

- Account registration and JWT-based authentication
- YUG and USD wallet balances
- Transfers with idempotency protection
- Deposits, transaction history, and live balance updates
- Double-entry ledger records and hash-chain audit checks
- Responsive React interface with QR wallet-address display

## Stack

- Frontend: React, Create React App, Socket.io client, Tailwind/PostCSS
- Backend: Node.js, Express, Mongoose, Socket.io, JWT, bcrypt
- Database: MongoDB

## Project layout

```text
yugcoin/
|- backend/       # Express API, models, wallet service, and tests
|- frontend/      # React application
|- package.json   # convenience frontend scripts
`- README.md
```

## Run locally

Prerequisites: Node.js 18+, npm, and a MongoDB database.

1. Create `backend/.env`:

   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
   JWT_SECRET=replace-with-a-strong-secret
   PORT=5000
   ```

2. Start the API:

   ```bash
   cd backend
   npm install
   npm start
   ```

3. In another terminal, start the frontend:

   ```bash
   cd frontend
   npm install
   REACT_APP_API_URL=http://localhost:5000/api npm start
   ```

On Windows PowerShell, set the API URL with:

```powershell
$env:REACT_APP_API_URL = 'http://localhost:5000/api'
npm start
```

If `REACT_APP_API_URL` is not set, the frontend uses the deployed YugCoin API.

## Build and verify

Build the frontend production bundle:

```bash
npm run build
```

Run the backend tests:

```bash
cd backend
npm test
```

The current backend test file still targets a retired in-memory wallet-engine API. It should be updated to run against an isolated MongoDB test database before it can serve as a reliable CI check for the production MongoDB implementation.

## Contributing

Keep changes focused, do not commit `.env` files or `node_modules`, and run the relevant build or tests before opening a pull request.

## Contacts

- https://github.com/drj7zz
- https://github.com/coder-khushi
- giridirghraj@gmail.com
