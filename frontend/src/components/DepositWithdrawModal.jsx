import React, { useState } from 'react';
import { X, ArrowDownRight, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function DepositWithdrawModal({ onClose, onSuccess }) {
  const [amount, setAmount] = useState('250');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currency = 'YUG';

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError('');
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const res = await api.deposit(num, currency);
      if (res.success) {
        onSuccess(`Added ${num} YUG to account`);
        onClose();
      } else {
        setError(res.error || 'Top-up failed');
      }
    } catch (err) {
      setError(err.message || 'Top-up network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ background: '#10b981', width: '36px', height: '36px', borderRadius: '50%', color: '#fff' }}>
              <ArrowDownRight size={18} />
            </div>
            <h3 className="font-extrabold" style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Account Top-up</h3>
          </div>
          <button
            className="flex items-center justify-center"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '50%', color: 'var(--text-muted)', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 animate-slide-in" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleDeposit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Amount (YUG Coin)</label>
            <input
              type="number"
              className="liquid-input"
              style={{ fontSize: '1.2rem', fontWeight: 600 }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', border: '1px dashed rgba(255,255,255,0.1)' }}>
            Funds will be instantly deposited to your liquid ledger via the testnet faucet.
          </div>

          <button type="submit" className="liquid-btn-primary" disabled={loading} style={{ padding: '1rem', marginTop: '0.5rem', background: '#10b981' }}>
            {loading ? 'Processing...' : `Add ${amount || 0} YUG`}
          </button>
        </form>
      </div>
    </div>
  );
}
