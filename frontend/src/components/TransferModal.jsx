import React, { useState } from 'react';
import { X, Send, ShieldCheck, AlertCircle, ScanLine } from 'lucide-react';
import { api } from '../services/api';
import WalletQrScanner from './WalletQrScanner';

export default function TransferModal({ wallets, onClose, onSuccess, initialDestinationAddress = '', initialAmount = '', initialDescription = '' }) {
  const [destinationAddress, setDestinationAddress] = useState(initialDestinationAddress);
  const [amount, setAmount] = useState(initialAmount);
  const [securityPin, setSecurityPin] = useState('');
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

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
    if (!description.trim()) {
      setError('A payment note or reference is required');
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
        onClose();
        onSuccess('Transfer executed successfully', res.transaction);
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
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ background: 'var(--primary)', width: '36px', height: '36px', borderRadius: '50%', color: '#fff' }}>
              <Send size={18} />
            </div>
            <h3 className="font-extrabold" style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Send YUG Coin</h3>
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

        <form onSubmit={handleTransfer} className="flex flex-col gap-4">

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center gap-2">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Recipient wallet ID or username</label>
              <button type="button" className="scan-address-button" onClick={() => setShowScanner((visible) => !visible)}>
                <ScanLine size={15} /> {showScanner ? 'Close scanner' : 'Scan QR'}
              </button>
            </div>
            {showScanner && (
              <WalletQrScanner
                onClose={() => setShowScanner(false)}
                onScan={(address) => {
                  setDestinationAddress(address);
                  setShowScanner(false);
                  setError('');
                }}
              />
            )}
            <input
              type="text"
              className="liquid-input"
              style={{ fontFamily: 'monospace' }}
              placeholder="e.g. @alex-8f3a92 or YUG-8F3A29B"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value.trim())}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Amount (YUG Coin)</label>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Available: <strong style={{ color: 'var(--primary)' }}>{currentWallet.balance} YUG</strong>
              </span>
            </div>
            <input
              type="number"
              step="any"
              className="liquid-input"
              style={{ fontSize: '1.2rem', fontWeight: 600 }}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Note / Reference</label>
            <input
              type="text"
              className="liquid-input"
              placeholder="Payment reference"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {numAmount > 0 && (
            <div className="flex flex-col gap-2" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }}>
              <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>Transfer Amount:</span>
                <span className="font-bold text-current">{numAmount} YUG</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>Processing Fee (0.1%):</span>
                <span className="font-bold text-current">{calculatedFee} YUG</span>
              </div>
              <div className="flex justify-between" style={{ fontWeight: 700, paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                <span>Total Debit:</span>
                <span style={{ color: '#f43f5e' }}>-{totalDeduction} YUG</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              <ShieldCheck size={16} color="var(--primary)" /> Enter 4-Digit Security PIN
            </label>
            <input
              type="password"
              maxLength={4}
              className="liquid-input"
              style={{ fontFamily: 'monospace', letterSpacing: '0.2em' }}
              placeholder="1234"
              value={securityPin}
              onChange={(e) => setSecurityPin(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="liquid-btn-primary" disabled={loading} style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '1.05rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Executing Transfer...' : 'Confirm Transfer'}
          </button>
        </form>
      </div>
    </div>
  );
}
