import React from 'react';
import { PieChart } from 'lucide-react';

export default function AnalyticsView({ history, wallets }) {
  const yugWallet = wallets.find(w => w.currency === 'YUG') || { balance: 0 };

  const totalTxs = history.length;
  const transfersCount = history.filter(t => t.type === 'TRANSFER').length;
  const depositsCount = history.filter(t => t.type === 'DEPOSIT').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <PieChart size={24} color="var(--primary)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Wallet Activity & Analytics</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Transaction statistics and balance velocity breakdown for YUG Coin.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        
        {/* Balance Status */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Account Balance</h3>
          
          <div className="glass-panel" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>YUG Coin Reserve</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{yugWallet.balance} YUG</div>
            </div>
            <div className="badge-demo">ACTIVE</div>
          </div>
        </div>

        {/* Transaction Volume */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Journal Breakdown</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="glass-panel" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{totalTxs}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Executed</div>
            </div>

            <div className="glass-panel" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{transfersCount}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transfers</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Top-up Operations:</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{depositsCount}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
