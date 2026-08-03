import React, { useState } from 'react';
import { X, ArrowDownRight } from 'lucide-react';
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
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-icon" style={{ background: '#10b981', width: '32px', height: '32px' }}>
              <ArrowDownRight size={16} />
            </div>
            <h3>Account Top-up</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Amount (YUG Coin)</label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="glass-panel" style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            * Adds virtual demo money to your wallet balance for testing.
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px', marginTop: '4px', background: '#10b981' }}>
            {loading ? 'Processing...' : `Add ${amount} YUG`}
          </button>
        </form>
      </div>
    </div>
  );
}
