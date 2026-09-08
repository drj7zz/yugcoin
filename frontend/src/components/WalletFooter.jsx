import React, { useState } from 'react';
import { QrCode, ScanLine, Copy, Check, Download, X, Eye, UserRound } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import WalletQrScanner from './WalletQrScanner';
import { money } from '../utils/format';

export default function WalletFooter({ user, wallets, onScanRecipient, onOpenSend }) {
  const [panel, setPanel] = useState(null);   // null | 'wallet'
  const [qrMode, setQrMode] = useState('show'); // 'show' | 'scan'
  const [copied, setCopied] = useState(false);

  const activeWallet = wallets.find(w => w.currency === 'YUG') || { balance: 0, walletAddress: user?.walletAddress || 'N/A' };
  const username = user?.username || user?.email?.split('@')[0] || '';
  const receiveIdentifier = username ? `@${username}` : user?.walletAddress || 'N/A';
  const qrPaymentPayload = `YUGCOIN|${username}|${encodeURIComponent(user?.name || '')}|${user?.walletAddress || ''}`;

  const closePanel = () => setPanel(null);
  const openPanel = (mode) => { setQrMode(mode); setPanel('wallet'); };

  const handleCopy = () => {
    if (!receiveIdentifier) return;
    navigator.clipboard.writeText(receiveIdentifier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQr = () => {
    const svg = document.querySelector('.wallet-qr-frame svg');
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

  return (
    <>
      {panel === 'wallet' && (
        <section className="wallet-footer-panel animate-slide-in" role="dialog" aria-label="Wallet QR tools">
          <div className="flex justify-between items-center w-full" style={{ marginBottom: '0.75rem' }}>
            <span className="qr-receive-label">Wallet Tools</span>
            <button type="button" className="scanner-close" onClick={closePanel} aria-label="Close wallet panel"><X size={16} /></button>
          </div>

          <div className="qr-switch" role="tablist" aria-label="QR mode">
            <button type="button" data-active={qrMode === 'show'} onClick={() => setQrMode('show')} role="tab">
              <QrCode size={15} /> Show Code
            </button>
            <button type="button" data-active={qrMode === 'scan'} onClick={() => setQrMode('scan')} role="tab">
              <ScanLine size={15} /> Scan
            </button>
          </div>

          {qrMode === 'show' ? (
            <div className="wallet-qr-body">
              <div className="flex items-center" style={{ gap: '1.1rem', flexWrap: 'wrap' }}>
                <div className="qr-code-frame wallet-qr-frame">
                  <QRCodeSVG value={qrPaymentPayload} size={140} fgColor="#111827" bgColor="#ffffff" level="M" includeMargin />
                </div>
                <div className="flex flex-col" style={{ gap: '0.5rem', minWidth: 150 }}>
                  <strong style={{ fontSize: '0.98rem' }}>Scan to pay me</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)', overflowWrap: 'anywhere' }}>{receiveIdentifier}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.name || '—'} · Balance {money(activeWallet.balance)} YUG</span>
                  <div className="flex" style={{ gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    <button type="button" className="scan-address-button" onClick={handleCopy}>
                      {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy ID'}
                    </button>
                    <button type="button" className="scan-address-button" onClick={downloadQr}>
                      <Download size={14} /> Download
                    </button>
                  </div>
                </div>
              </div>
              <button type="button" className="liquid-btn-secondary flex items-center justify-center gap-2 w-full" onClick={() => { closePanel(); onOpenSend?.(); }} style={{ marginTop: '0.9rem', fontSize: '0.88rem' }}>
                <UserRound size={15} /> Send to someone
              </button>
            </div>
          ) : (
            <WalletQrScanner
              onClose={closePanel}
              onScan={(address) => { closePanel(); onScanRecipient?.(address); }}
            />
          )}
        </section>
      )}

      <nav className="wallet-footer" aria-label="Wallet quick actions">
        <button className="wallet-footer-btn" onClick={handleCopy}>
          {copied ? <Check size={20} color="var(--primary)" /> : <Copy size={20} />} {copied ? 'Copied' : 'Copy ID'}
        </button>
        <button className="wallet-footer-btn" data-active={panel === 'wallet'} onClick={() => (panel ? closePanel() : openPanel('show'))}>
          {panel ? <Eye size={20} /> : <QrCode size={20} />} {panel ? 'Hide' : 'My QR'}
        </button>
        <button className="wallet-footer-btn" onClick={() => openPanel('scan')}>
          <ScanLine size={20} /> Scan
        </button>
      </nav>
    </>
  );
}
