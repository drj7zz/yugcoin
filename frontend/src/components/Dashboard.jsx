import React, { useState } from 'react';
import { Send, ArrowDownRight, Copy, Check, BarChart2, ArrowUpRight, Clock, User } from 'lucide-react';

export default function Dashboard({ user, wallets, history, onOpenSend, onOpenDeposit, onNavigateInsights }) {
  const [copied, setCopied] = useState(false);

  const activeWallet = wallets.find(w => w.currency === 'YUG') || { balance: 0, walletAddress: user?.walletAddress || 'N/A' };

  const handleCopy = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Account Overview Header with Circular Profile */}
      <div className="glass-card" style={{ padding: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="user-avatar-circle" style={{ width: '48px', height: '48px' }}>
              <User size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wallet ID: {user?.walletAddress}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={handleCopy} 
              className="btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy ID'}
            </button>
          </div>

        </div>

        {/* Balance Display */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
            Total Balance
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span>{activeWallet.balance.toLocaleString()}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>YUG</span>
          </div>
        </div>

        {/* Responsive Quick Action Buttons */}
        <div className="action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
          <button className="btn-primary" onClick={onOpenSend}>
            <Send size={15} /> Send Money
          </button>
          
          <button className="btn-secondary" onClick={onOpenDeposit}>
            <ArrowDownRight size={15} color="#10b981" /> Add Funds
          </button>

          <button className="btn-secondary" onClick={onNavigateInsights}>
            <BarChart2 size={15} color="#2563eb" /> Insights & Audit
          </button>
        </div>

      </div>

      {/* Transaction Activity Journal */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Recent Activity</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live ledger sync</span>
        </div>

        {history.length === 0 ? (
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No recent activity. Send money or add funds to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((tx, idx) => {
              const isSender = tx.sourceAddress === user?.walletAddress;
              const isDeposit = tx.type === 'DEPOSIT';
              const displayType = isDeposit ? 'Account Top-up' : (isSender ? 'Sent Money' : 'Received Money');

              return (
                <div 
                  key={tx.transactionId || idx} 
                  className="glass-panel" 
                  style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justify: 'center',
                        background: isDeposit 
                          ? '#dcfce7' 
                          : (isSender ? '#ffe4e6' : '#e0f2fe'),
                        color: isDeposit 
                          ? '#15803d' 
                          : (isSender ? '#be123c' : '#0369a1')
                      }}
                    >
                      {isDeposit ? <ArrowDownRight size={16} /> : (isSender ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />)}
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        {displayType}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <span>Ref: <code>{isSender ? tx.destinationAddress : tx.sourceAddress}</code></span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} /> {new Date(tx.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div 
                      style={{ 
                        fontWeight: 700, 
                        fontSize: '0.95rem', 
                        color: isSender ? '#be123c' : '#15803d' 
                      }}
                    >
                      {isSender ? '-' : '+'}{tx.amount} YUG
                    </div>
                    {tx.fee > 0 && isSender && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
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
