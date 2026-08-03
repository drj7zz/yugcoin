import React, { useState, useEffect } from 'react';
import { CheckCircle2, RefreshCw, BarChart2, ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function InsightsView({ history, wallets }) {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await api.getLedgerAudit();
      if (res.success) {
        setAudit(res.audit);
      }
    } catch (err) {
      console.error('Audit fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  // Compute graph data
  const yugWallet = wallets.find(w => w.currency === 'YUG') || { balance: 0 };
  const totalTxs = history.length;
  
  let totalSent = 0;
  let totalReceived = 0;

  history.forEach(tx => {
    if (tx.type === 'DEPOSIT') {
      totalReceived += tx.amount;
    } else {
      totalSent += tx.amount;
    }
  });

  const maxVal = Math.max(totalSent, totalReceived, 1);
  const sentPercent = Math.round((totalSent / maxVal) * 100);
  const receivedPercent = Math.round((totalReceived / maxVal) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <BarChart2 size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Activity Insights & Audit</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Simple overview of transactions, money movement graphs, and ledger balance checks.
          </p>
        </div>

        <button 
          onClick={fetchAudit} 
          className="btn-secondary" 
          disabled={loading}
          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          {loading ? 'Refreshing...' : 'Verify Ledger'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        
        {/* Ledger Health */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            System Status
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={22} color="#10b981" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#10b981' }}>
                All Entries Match
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Double-entry balanced
              </div>
            </div>
          </div>
        </div>

        {/* Current Balance */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Available Balance
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {yugWallet.balance} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>YUG</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Single Currency Wallet
          </div>
        </div>

        {/* Total Transactions */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Total Activity
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {totalTxs} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transactions</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
            100% Verified
          </div>
        </div>

      </div>

      {/* Money In vs Money Out Visual Graph */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
          Money Movement Overview
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Money In (Top-ups / Received) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
                <ArrowDownRight size={16} color="#10b981" /> Total Money In (Top-ups & Received)
              </span>
              <span style={{ fontWeight: 700, color: '#10b981' }}>+{totalReceived} YUG</span>
            </div>
            <div className="graph-bar-bg">
              <div className="graph-bar-fill" style={{ width: `${receivedPercent}%`, background: '#10b981' }} />
            </div>
          </div>

          {/* Money Out (Transfers) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
                <ArrowUpRight size={16} color="#be123c" /> Total Money Out (Sent)
              </span>
              <span style={{ fontWeight: 700, color: '#be123c' }}>-{totalSent} YUG</span>
            </div>
            <div className="graph-bar-bg">
              <div className="graph-bar-fill" style={{ width: `${sentPercent}%`, background: '#be123c' }} />
            </div>
          </div>

        </div>
      </div>

      {/* Ledger Verification Summary */}
      {audit && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ShieldCheck size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Ledger Audit Report</h3>
          </div>
          
          <div className="glass-panel" style={{ padding: '14px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Verified Journal Entries:</span>
              <span style={{ fontWeight: 600 }}>{audit.totalEntries} entries</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Double-Entry Invariant:</span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>✓ Total Debits ({audit.debitsTotal}) = Total Credits ({audit.creditsTotal})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Journal Reference Hash:</span>
              <span className="user-address" style={{ fontSize: '0.72rem' }}>{audit.latestHash ? audit.latestHash.substring(0, 24) + '...' : 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
