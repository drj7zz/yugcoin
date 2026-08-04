const DEFAULT_API_BASE = 'https://yugcoin-backend.onrender.com/api';
const API_BASE = process.env.REACT_APP_API_URL || DEFAULT_API_BASE;

const getHeaders = () => {
  const token = localStorage.getItem('yugcoin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  try {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    return data;
  } catch (err) {
    if (err.name === 'SyntaxError') {
      // Handles HTML/empty proxy errors (like 502 Bad Gateway) when backend is down
      throw new Error(`Server Error (${res.status}): The backend might be offline.`);
    }
    throw err;
  }
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Wallet Engine Operations
  getBalances: async () => {
    const res = await fetch(`${API_BASE}/wallet/balances`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  transfer: async (transferData) => {
    const res = await fetch(`${API_BASE}/wallet/transfer`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'X-Idempotency-Key': transferData.idempotencyKey || `TX-KEY-${Date.now()}`
      },
      body: JSON.stringify(transferData)
    });
    return handleResponse(res);
  },

  deposit: async (amount, currency = 'YUG') => {
    const res = await fetch(`${API_BASE}/wallet/deposit`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'X-Idempotency-Key': `DEP-KEY-${Date.now()}`
      },
      body: JSON.stringify({ amount, currency })
    });
    return handleResponse(res);
  },

  getHistory: async () => {
    const res = await fetch(`${API_BASE}/wallet/history`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getLedgerAudit: async () => {
    const res = await fetch(`${API_BASE}/wallet/audit`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
