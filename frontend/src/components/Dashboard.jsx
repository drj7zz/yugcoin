import React, { useEffect, useState } from 'react';
import { Send, Ticket, Copy, Check, BarChart2, ArrowDownRight, ArrowUpRight, Clock, User, QrCode, ScanLine, Download, ReceiptText, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import WalletQrScanner from './WalletQrScanner';
import TransactionStatementModal from './TransactionStatementModal';

export default function Dashboard({ user, wallets, history, onOpenSend, onOpenCoupon, onNavigateInsights, onNavigateProfile, onScanRecipient, onRedoPayment }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [statementTransaction, setStatementTransaction] = useState(null);

  const openOverlay = (overlay) => window.history.pushState({ ...window.history.state, yugcoinTab: 'dashboard', yugcoinOverlay: overlay }, '', window.location.href);
  const clearOverlay = () => {
    if (window.history.state?.yugcoinOverlay) window.history.replaceState({ ...window.history.state, yugcoinOverlay: null }, '', window.location.href);
  };
  const closeDashboardOverlay = () => { clearOverlay(); setShowQR(false); setShowScanner(false); setStatementTransaction(null); };
  const openStatement = (transaction) => { openOverlay('statement'); setStatementTransaction(transaction); };

  useEffect(() => {
    const closeOnBack = () => closeDashboardOverlay();
    window.addEventListener('popstate', closeOnBack);
    window.addEventListener('yugcoin:close-overlay', closeOnBack);
    return () => {
      window.removeEventListener('popstate', closeOnBack);
      window.removeEventListener('yugcoin:close-overlay', closeOnBack);
    };
  }, []);

  const downloadQr = () => {
    const svg = document.querySelector('.qr-code-frame svg');
    if (!svg) return;

    const image = new Image();
    const serialized = new XMLSerializer().serializeToString(svg);
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 850;
      const context = canvas.getContext('2d');
      context.fillStyle = '#f8fafc';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#0f172a';
      context.font = '700 42px Arial, sans-serif';
      context.textAlign = 'center';
      context.fillText('YugCoin', canvas.width / 2, 64);
      context.fillStyle = '#475569';
      context.font = '500 20px Arial, sans-serif';
      context.fillText('Scan to send YUG', canvas.width / 2, 98);
      context.drawImage(image, 150, 130, 420, 420);
      const rows = [receiveIdentifier, user?.name || '—', user?.walletAddress || '—'];
      rows.forEach((row, index) => {
        context.fillStyle = index === 0 ? '#0369a1' : '#334155';
        context.font = index === 0 ? '700 25px Arial, sans-serif' : '500 19px monospace';
        context.fillText(row, canvas.width / 2, 620 + (index * 54));
      });
      context.fillStyle = '#64748b';
      context.font = '500 16px Arial, sans-serif';
      context.fillText('YugCoin payment profile', canvas.width / 2, 800);

      const link = document.createElement('a');
      link.download = `yugcoin-wallet-${user?.walletAddress || 'qr'}.jpeg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
  };

  const activeWallet = wallets.find(w => w.currency === 'YUG') || { balance: 0, walletAddress: user?.walletAddress || 'N/A' };
  const username = user?.username || user?.email?.split('@')[0] || '';
  const receiveIdentifier = username ? `@${username}` : user?.walletAddress || 'N/A';
  const qrPaymentPayload = `YUGCOIN|${username}|${encodeURIComponent(user?.name || '')}|${user?.walletAddress || ''}`;

  const handleCopy = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(receiveIdentifier);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-in">

      {/* Account Overview Header */}
      <div className="glass-card" style={{ padding: '2rem' }}>

        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <button type="button" className="dashboard-profile-trigger flex items-center gap-4" onClick={onNavigateProfile} title="Open profile and security settings">
            <div className="flex items-center justify-center" style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-main)' }}>
              <User size={28} />
            </div>
            <div>
              <div className="font-extrabold" style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Welcome back, {user?.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.25rem' }}>{receiveIdentifier}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Wallet ID: {user?.walletAddress}</div>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (showQR) closeDashboardOverlay();
                else { openOverlay('qr'); setShowQR(true); setShowScanner(false); }
              }}
              className="liquid-btn-secondary flex items-center justify-center gap-2"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <QrCode size={16} /> Show QR
            </button>
            <button
              onClick={() => {
                if (showScanner) closeDashboardOverlay();
                else { openOverlay('scanner'); setShowScanner(true); setShowQR(false); }
              }}
              className="liquid-btn-secondary flex items-center justify-center gap-2"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <ScanLine size={16} /> Scan QR
            </button>
            <button
              onClick={handleCopy}
              className="liquid-btn-primary flex items-center justify-center gap-2"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: copied ? '#10b981' : undefined }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy Username'}
            </button>
          </div>
        </div>

        {/* Conditional QR Code Display */}
        {showQR && (
          <div className="qr-receive-card animate-slide-in">
            <div className="qr-receive-copy">
              <div className="flex justify-between items-center w-full">
                <span className="qr-receive-label">Receive YUG</span>
                <button type="button" className="scanner-close" onClick={closeDashboardOverlay} aria-label="Close QR code"><X size={16} /></button>
              </div>
              <strong>Scan to receive assets</strong>
              <p>Share your username QR to receive funds without exposing your wallet ID.</p>
              <button type="button" className="scan-address-button" onClick={downloadQr}>
                <Download size={15} /> Download JPEG
              </button>
            </div>
            <div className="qr-receive-visual">
              <div className="qr-code-frame">
                <QRCodeSVG value={qrPaymentPayload} size={180} fgColor="#111827" bgColor="#ffffff" level="M" includeMargin />
              </div>
              <div className="qr-identity-details">
                <p>{receiveIdentifier}</p>
                <p>{user?.name || '—'}</p>
                <p>{user?.walletAddress || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {showScanner && (
          <div style={{ marginBottom: '2rem' }}>
            <WalletQrScanner
              onClose={closeDashboardOverlay}
              onScan={(address) => {
                closeDashboardOverlay();
                onScanRecipient(address);
              }}
            />
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

          <button className="liquid-btn-secondary flex items-center justify-center gap-2" onClick={onOpenCoupon} style={{ padding: '1rem' }}>
            <Ticket size={18} color="#f9a8d4" /> Redeem Coupon
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
                  role="button"
                  tabIndex={0}
                  aria-label={`Open statement for ${displayType} transaction`}
                  style={{
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '1rem',
                    transition: 'transform 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => openStatement(tx)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openStatement(tx);
                    }
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
                      <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>Ref: {isSender ? (tx.destinationUsername ? `@${tx.destinationUsername}` : tx.destinationAddress?.substring(0,8) + '...') : (tx.sourceUsername ? `@${tx.sourceUsername}` : tx.sourceAddress?.substring(0,8) + '...')}</span>
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
                    <button type="button" className="statement-link" onClick={(event) => { event.stopPropagation(); openStatement(tx); }}><ReceiptText size={14} /> Statement</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {statementTransaction && <TransactionStatementModal transaction={statementTransaction} walletAddress={user?.walletAddress} user={user} onClose={closeDashboardOverlay} onRedo={(draft) => { closeDashboardOverlay(); onRedoPayment(draft); }} />}

    </div>
  );
}
