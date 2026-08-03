import React, { useState } from 'react';
import { X, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function TransferModal({ wallets, onClose, onSuccess }) {
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currency = 'YUG';
  const currentWallet = wallets.find(w => w.currency === currency) || { balance: 0 };
  const feeRate = 0.001;
  const numAmount = parseFloat(amount) || 0;
  const calculatedFee = Math.round(numAmount * feeRate * 10000) / 10000;
  const totalDeduction = numAmount + calculatedFee;

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');

    if (!destinationAddress) {
      setError('Please enter destination wallet address');
      return;
    }
    if (!amount || numAmount <= 0) {
      setError('Please enter a valid transfer amount');
      return;
    }
    if (totalDeduction > currentWallet.balance) {
      setError(`Insufficient balance. Required: ${totalDeduction} YUG, Available: ${currentWallet.balance} YUG`);
      return;
    }
    if (!securityPin || securityPin.length < 4) {
      setError('Please enter your 4-digit Security PIN');
      return;
    }

    setLoading(true);

    try {
      const res = await api.transfer({
        destinationAddress,
        amount: numAmount,
        currency,
        securityPin,
        description,
        idempotencyKey: `TX-IDEM-${Date.now()}-${Math.floor(Math.random()*1000)}`
      });

      if (res.success) {
        onSuccess('Transfer executed successfully');
        onClose();
      } else {
        setError(res.error || 'Transfer failed');
      }
    } catch (err) {
      setError(err.message || 'Transfer network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-icon" style={{ background: '#3b82f6', width: '32px', height: '32px' }}>
              <Send size={16} />
            </div>
            <h3>Send YUG Coin</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Recipient Address */}
          <div className="form-group">
            <label>Recipient Wallet Address</label>
            <input
              type="text"
              className="form-input mono"
              placeholder="e.g. YUG-8F3A29B"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value.trim())}
              required
            />
          </div>

          {/* Amount */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Amount (YUG Coin)</label>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Available: <strong style={{ color: 'var(--accent-cyan)' }}>{currentWallet.balance} YUG</strong>
              </span>
            </div>
            <input
              type="number"
              step="any"
              className="form-input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Note / Description */}
          <div className="form-group">
            <label>Note / Reference (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Payment reference"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Breakdown */}
          {numAmount > 0 && (
            <div className="glass-panel" style={{ padding: '12px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Transfer Amount:</span>
                <span>{numAmount} YUG</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Processing Fee (0.1%):</span>
                <span>{calculatedFee} YUG</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '4px', borderTop: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                <span>Total Debit:</span>
                <span style={{ color: 'var(--accent-rose)' }}>-{totalDeduction} YUG</span>
              </div>
            </div>
          )}

          {/* Security PIN */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--accent-amber)" /> Enter 4-Digit Security PIN
            </label>
            <input
              type="password"
              maxLength={4}
              className="form-input mono"
              placeholder="1234"
              value={securityPin}
              onChange={(e) => setSecurityPin(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px', marginTop: '4px', fontSize: '0.95rem' }}>
            {loading ? 'Executing Transfer...' : 'Confirm Transfer'}
          </button>
        </form>
      </div>
    </div>
  );
}
