import React, { useState } from 'react';
import { Send, ArrowDownRight, Copy, Check, BarChart2, ArrowUpRight, Clock, User, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard({ user, wallets, history, onOpenSend, onOpenDeposit, onNavigateInsights }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const activeWallet = wallets.find(w => w.currency === 'YUG') || { balance: 0, walletAddress: user?.walletAddress || 'N/A' };

  const handleCopy = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-in">

      {/* Account Overview Header */}
      <div className="glass-card" style={{ padding: '2rem' }}>

        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center" style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-main)' }}>
              <User size={28} />
            </div>
            <div>
              <div className="font-extrabold" style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Welcome back, {user?.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.25rem' }}>ID: {user?.walletAddress}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQR(!showQR)}
              className="liquid-btn-secondary flex items-center justify-center gap-2"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <QrCode size={16} /> Show QR
            </button>
            <button
              onClick={handleCopy}
              className="liquid-btn-primary flex items-center justify-center gap-2"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: copied ? '#10b981' : undefined }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy ID'}
            </button>
          </div>
        </div>

        {/* Conditional QR Code Display */}
        {showQR && (
          <div className="qr-receive-card animate-slide-in">
            <div className="qr-receive-copy">
              <span className="qr-receive-label">Receive YUG</span>
              <strong>Scan to receive assets</strong>
              <p>Share this code to receive funds directly in your wallet.</p>
              <code>{user?.walletAddress || 'N/A'}</code>
            </div>
            <div className="qr-code-frame">
              <QRCodeSVG value={user?.walletAddress || 'N/A'} size={180} fgColor="#111827" bgColor="#ffffff" level="M" includeMargin />
            </div>
          </div>
        )}

        {/* Balance Display */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 600 }}>
            Total Liquid Balance
          </div>
          <div className="font-extrabold text-gradient" style={{ fontSize: '3.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '0.5rem', lineHeight: 1 }}>
            <span>{activeWallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span style={{ fontSize: '1.5rem', color: 'var(--text-main)', opacity: 0.8 }}>YUG</span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid-cols-3">
          <button className="liquid-btn-primary flex items-center justify-center gap-2" onClick={onOpenSend} style={{ padding: '1rem' }}>
            <Send size={18} /> Send Funds
          </button>

          <button className="liquid-btn-secondary flex items-center justify-center gap-2" onClick={onOpenDeposit} style={{ padding: '1rem' }}>
            <ArrowDownRight size={18} color="#10b981" /> Deposit Assets
          </button>

          <button className="liquid-btn-secondary flex items-center justify-center gap-2" onClick={onNavigateInsights} style={{ padding: '1rem' }}>
            <BarChart2 size={18} color="var(--primary)" /> View Insights
          </button>
        </div>

      </div>

      {/* Transaction Activity Journal */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h3 className="font-bold" style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Live Ledger Activity</h3>
          <div className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} className="animate-pulse"></span>
            Syncing Live
          </div>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: '3rem 1rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.05)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.2)' }}>
            <Clock size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No recent activity. Send money or add funds to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {history.map((tx, idx) => {
              const isSender = tx.sourceAddress === user?.walletAddress;
              const isDeposit = tx.type === 'DEPOSIT';
              const displayType = isDeposit ? 'Deposit Received' : (isSender ? 'Funds Sent' : 'Funds Received');
              const txColor = isDeposit ? '#10b981' : (isSender ? '#f43f5e' : '#38bdf8');
              const txBg = isDeposit ? 'rgba(16, 185, 129, 0.1)' : (isSender ? 'rgba(244, 63, 94, 0.1)' : 'rgba(56, 189, 248, 0.1)');

              return (
                <div
                  key={tx.transactionId || idx}
                  className="flex items-center justify-between animate-slide-in"
                  style={{
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '1rem',
                    transition: 'transform 0.2s',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: txBg, color: txColor }}>
                      {isDeposit ? <ArrowDownRight size={20} /> : (isSender ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />)}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="font-bold" style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {displayType}
                      </div>
                      <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        <span>Ref: {isSender ? tx.destinationAddress?.substring(0,8) + '...' : tx.sourceAddress?.substring(0,8) + '...'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {new Date(tx.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="font-extrabold" style={{ fontSize: '1.1rem', color: txColor }}>
                      {isSender ? '-' : '+'}{tx.amount} YUG
                    </div>
                    {tx.fee > 0 && isSender && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Fee: {tx.fee} YUG
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
