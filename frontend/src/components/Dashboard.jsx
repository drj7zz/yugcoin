import React, { useState } from 'react';
import { Send, Ticket, Copy, Check, ArrowDownRight, ArrowUpRight, Clock, QrCode, ScanLine, Download, X, Eye, EyeOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import WalletQrScanner from './WalletQrScanner';
import TransactionStatementModal from './TransactionStatementModal';
import { money } from '../utils/format';
import { SkeletonBalance, SkeletonTxList } from './Skeleton';

export default function Dashboard({ user, wallets, history, loading, onOpenSend, onOpenCoupon, onScanRecipient, onRedoPayment }) {
  const [copied, setCopied] = useState(false);
  const [footerView, setFooterView] = useState(null); // null | 'qr' | 'scan'
  const [statementTransaction, setStatementTransaction] = useState(null);
  const [hideBalance, setHideBalance] = useState(false);

  const closeFooter = () => setFooterView(null);
  const openStatement = (tx) => setStatementTransaction(tx);

  const downloadQr = () => {
    const svg = document.querySelector('.qr-code-frame svg');
    if (!svg) return;
    const image = new Image();
    const serialized = new XMLSerializer().serializeToString(svg);
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 800;
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#101215';
      context.font = '700 40px Arial, sans-serif';
      context.textAlign = 'center';
      context.fillText('YugCoin', canvas.width / 2, 64);
      context.fillStyle = '#8a919b';
      context.font = '500 20px Arial, sans-serif';
      context.fillText('Scan to send YUG', canvas.width / 2, 98);
      context.drawImage(image, 160, 130, 400, 400);
      context.fillStyle = '#101215';
      context.font = '700 26px Arial, sans-serif';
      context.fillText(receiveIdentifier, canvas.width / 2, 610);
      context.fillStyle = '#8a919b';
      context.font = '500 18px monospace';
      context.fillText(user?.name || '—', canvas.width / 2, 660);
      const link = document.createElement('a');
      link.download = `yugcoin-receive-${username || 'qr'}.jpeg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
  };

  const activeWallet = wallets.find(w => w.currency === 'YUG') || { balance: 0, walletAddress: user?.walletAddress || 'N/A' };
  const username = user?.username || user?.email?.split('@')[0] || '';
  const receiveIdentifier = username ? `@${username}` : user?.walletAddress || 'N/A';
  const qrPaymentPayload = `YUGCOIN|${username}|${encodeURIComponent(user?.name || '')}|${user?.walletAddress || ''}`;

  // Only the user's own movements — a wallet shows your money, not the ledger.
  const myHistory = (history || []).filter(tx =>
    tx.sourceAddress === user?.walletAddress || tx.destinationAddress === user?.walletAddress
  );

  const handleCopy = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(receiveIdentifier);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col page-enter w-full" style={{ paddingTop: '0.5rem' }}>

      {/* Balance */}
      <section className="flat-section" style={{ paddingTop: '1.25rem' }}>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Available balance
          </span>
          <button
            type="button"
            onClick={() => setHideBalance(v => !v)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
            title={hideBalance ? 'Show balance' : 'Hide balance'}
          >
            {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {loading ? (
          <div style={{ marginTop: '0.75rem' }}><SkeletonBalance /></div>
        ) : (
          <div className="flex items-baseline" style={{ gap: '0.5rem', marginTop: '0.35rem', lineHeight: 1 }}>
            <span className="font-extrabold" style={{ fontSize: '3rem', letterSpacing: '-0.02em' }}>
              {hideBalance ? '••••' : money(activeWallet.balance)}
            </span>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700 }}>YUG</span>
          </div>
        )}
        <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.6rem', fontWeight: 600 }}>{receiveIdentifier}</div>
      </section>

      {/* Actions row — directly under the top nav */}
      <section className="flat-section" style={{ marginTop: '1.5rem' }}>
        <div className="flex" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="liquid-btn-primary flex items-center justify-center gap-2" onClick={onOpenSend} style={{ padding: '0.85rem 1.5rem', flex: 1, minWidth: 140 }}>
            <Send size={18} /> Send
          </button>
          <button
            className="liquid-btn-secondary flex items-center justify-center gap-2"
            onClick={() => setFooterView(footerView === 'qr' ? null : 'qr')}
            style={{ padding: '0.85rem 1.5rem', flex: 1, minWidth: 140 }}
          >
            <QrCode size={18} /> Receive
          </button>
          <button className="liquid-btn-secondary flex items-center justify-center gap-2" onClick={onOpenCoupon} style={{ padding: '0.85rem 1.5rem', flex: 1, minWidth: 140 }}>
            <Ticket size={18} /> Redeem
          </button>
        </div>
      </section>

      {/* Receive panel (also toggled from footer) */}
      {footerView === 'qr' && (
        <section className="flat-section animate-slide-in" style={{ marginTop: '1.5rem' }}>
          <div className="qr-receive-card" style={{ marginBottom: 0 }}>
            <div className="qr-receive-copy">
              <div className="flex justify-between items-center w-full">
                <span className="qr-receive-label">Receive YUG</span>
                <button type="button" className="scanner-close" onClick={closeFooter} aria-label="Close QR code"><X size={16} /></button>
              </div>
              <strong>Scan to pay me</strong>
              <p>Share your code to receive funds without exposing your wallet ID.</p>
              <button type="button" className="scan-address-button" onClick={downloadQr}>
                <Download size={15} /> Download
              </button>
            </div>
            <div className="qr-receive-visual">
              <div className="qr-code-frame">
                <QRCodeSVG value={qrPaymentPayload} size={170} fgColor="#111827" bgColor="#ffffff" level="M" includeMargin />
              </div>
              <div className="qr-identity-details">
                <p>{receiveIdentifier}</p>
                <p>{user?.name || '—'}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Scanner panel (also toggled from footer) */}
      {footerView === 'scan' && (
        <section className="flat-section animate-slide-in" style={{ marginTop: '1.5rem' }}>
          <WalletQrScanner
            onClose={closeFooter}
            onScan={(address) => {
              closeFooter();
              onScanRecipient(address);
            }}
          />
        </section>
      )}

      <hr className="section-divider" style={{ marginTop: '2rem' }} />

      {/* Activity — own transactions only */}
      <section className="flat-section">
        <h3 className="font-bold" style={{ fontSize: '1.05rem', marginBottom: '1.1rem' }}>Activity</h3>

        {loading ? (
          <SkeletonTxList />
        ) : myHistory.length === 0 ? (
          <div className="flex flex-col items-center" style={{ padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <Clock size={34} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '0.9rem' }}>No transactions yet. Send or receive YUG to get started.</p>
          </div>
        ) : (
          <ul className="flex flex-col" style={{ listStyle: 'none', gap: 0, padding: 0, margin: 0 }}>
            {myHistory.map((tx, idx) => {
              const isSender = tx.sourceAddress === user?.walletAddress;
              const label = tx.type === 'DEPOSIT' ? 'Deposit' : (isSender ? 'Sent' : 'Received');
              const counterparty = isSender
                ? (tx.destinationUsername ? `@${tx.destinationUsername}` : tx.destinationAddress)
                : (tx.sourceUsername ? `@${tx.sourceUsername}` : tx.sourceAddress);
              const color = isSender ? 'var(--danger)' : 'var(--primary)';
              const Icon = isSender ? ArrowUpRight : ArrowDownRight;
              return (
                <li key={tx.transactionId || idx}>
                  <button
                    type="button"
                    onClick={() => openStatement(tx)}
                    className="flex items-center justify-between w-full"
                    style={{
                      padding: '0.85rem 0.5rem',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-soft)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      font: 'inherit',
                      color: 'inherit',
                      width: '100%',
                    }}
                  >
                    <div className="flex items-center" style={{ gap: '0.9rem' }}>
                      <div className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--surface-raised)', color }}>
                        <Icon size={18} />
                      </div>
                      <div className="flex flex-col" style={{ gap: 2 }}>
                        <span className="font-bold" style={{ fontSize: '0.92rem' }}>{label}</span>
                        <span className="flex items-center" style={{ gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{counterparty || '—'}</span>
                          <span>·</span>
                          <Clock size={11} />
                          <span>{new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-extrabold" style={{ fontSize: '0.98rem', color }}>
                        {isSender ? '\u2212' : '+'}{money(tx.amount)} YUG
                      </span>
                      {isSender && tx.fee > 0 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fee {money(tx.fee)}</span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Fixed wallet footer — code / copy / scan switch */}
      <nav className="wallet-footer" aria-label="Wallet quick actions">
        <button className="wallet-footer-btn" data-active={footerView === 'qr'} onClick={() => setFooterView(footerView === 'qr' ? null : 'qr')}>
          <QrCode size={20} /> My Code
        </button>
        <button className="wallet-footer-btn" onClick={handleCopy}>
          {copied ? <Check size={20} color="var(--primary)" /> : <Copy size={20} />} {copied ? 'Copied' : 'Copy ID'}
        </button>
        <button className="wallet-footer-btn" data-active={footerView === 'scan'} onClick={() => setFooterView(footerView === 'scan' ? null : 'scan')}>
          <ScanLine size={20} /> Scan
        </button>
      </nav>

      {statementTransaction && (
        <TransactionStatementModal
          transaction={statementTransaction}
          walletAddress={user?.walletAddress}
          user={user}
          onClose={() => setStatementTransaction(null)}
          onRedo={(draft) => { setStatementTransaction(null); onRedoPayment(draft); }}
        />
      )}
    </div>
  );
}
