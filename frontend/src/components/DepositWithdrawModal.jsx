import React, { useState } from 'react';
import { X, Ticket, AlertCircle, ShieldCheck } from 'lucide-react';

export default function DepositWithdrawModal({ onClose }) {
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');

  const handleRedeem = (event) => {
    event.preventDefault();
    setError('');
    if (!couponCode.trim()) {
      setError('Enter a coupon code to continue.');
      return;
    }
    setError('Coupon validation is not available yet. Please try again when coupon redemption is released.');
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="coupon-title">
      <div className="modal-content">
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ background: 'rgba(249, 168, 212, 0.2)', width: '36px', height: '36px', borderRadius: '50%', color: '#f9a8d4' }}><Ticket size={18} /></div>
            <h3 id="coupon-title" className="font-extrabold" style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Redeem Coupon</h3>
          </div>
          <button type="button" className="scanner-close" onClick={onClose} aria-label="Close coupon redemption"><X size={18} /></button>
        </div>

        {error && <div className="flex items-center gap-2 animate-slide-in" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fda4af', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}><AlertCircle size={18} /> {error}</div>}

        <form onSubmit={handleRedeem} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Coupon code</label>
            <input type="text" className="liquid-input" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }} placeholder="YUG-XXXX-XXXX" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} required />
          </div>

          <div className="coupon-info"><ShieldCheck size={18} /><span>Your wallet is limited to the YUG balance received when it was created. Self top-ups are disabled. Valid coupon codes will be securely checked by the backend in a future release.</span></div>

          <button type="submit" className="liquid-btn-primary" style={{ padding: '1rem', marginTop: '0.5rem' }}>Validate Coupon</button>
        </form>
      </div>
    </div>
  );
}
