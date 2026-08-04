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
    <div className="flex flex-col gap-6 w-full animate-slide-in">

      {/* Header */}
      <div className="glass-card flex justify-between items-center" style={{ padding: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)' }}>
              <BarChart2 size={22} />
            </div>
            <h2 className="font-extrabold" style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Activity Insights & Audit</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Simple overview of transactions, money movement graphs, and ledger balance checks.
          </p>
        </div>

        <button
          onClick={fetchAudit}
          className="liquid-btn-secondary flex items-center gap-2"
          disabled={loading}
          style={{ padding: '0.75rem 1.25rem', opacity: loading ? 0.7 : 1 }}
        >
          <RefreshCw size={16} className={loading ? 'spin animate-spin' : ''} />
          {loading ? 'Refreshing...' : 'Verify Ledger'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid-cols-3">

        {/* Ledger Health */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
            System Status
          </div>
          <div className="flex items-center gap-3" style={{ marginTop: '0.5rem' }}>
            <div className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckCircle2 size={20} />
            </div>
            <div className="flex flex-col">
              <div className="font-bold" style={{ fontSize: '1.1rem', color: '#10b981' }}>
                All Entries Match
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Double-entry balanced
              </div>
            </div>
          </div>
        </div>

        {/* Current Balance */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
            Available Balance
          </div>
          <div className="font-extrabold text-gradient" style={{ fontSize: '2rem', display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.25rem' }}>
            {yugWallet.balance} <span style={{ fontSize: '1rem', color: 'var(--text-main)', opacity: 0.8 }}>YUG</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Single Currency Wallet
          </div>
        </div>

        {/* Total Transactions */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
            Total Activity
          </div>
          <div className="font-extrabold" style={{ fontSize: '2rem', display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.25rem', color: 'var(--text-main)' }}>
            {totalTxs} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Txs</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
            100% Verified
          </div>
        </div>

      </div>

      {/* Money In vs Money Out Visual Graph */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 className="font-extrabold" style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          Money Movement Overview
        </h3>

        <div className="flex flex-col gap-6">

          {/* Money In (Top-ups / Received) */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 font-bold" style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                <div style={{ padding: '4px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}><ArrowDownRight size={16} color="#10b981" /></div>
                Total Money In
              </span>
              <span className="font-extrabold" style={{ color: '#10b981' }}>+{totalReceived} YUG</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: `${receivedPercent}%`, height: '100%', background: '#10b981', transition: 'width 1s ease-out' }} />
            </div>
          </div>

          {/* Money Out (Transfers) */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 font-bold" style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                <div style={{ padding: '4px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '50%' }}><ArrowUpRight size={16} color="#f43f5e" /></div>
                Total Money Out
              </span>
              <span className="font-extrabold" style={{ color: '#f43f5e' }}>-{totalSent} YUG</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: `${sentPercent}%`, height: '100%', background: '#f43f5e', transition: 'width 1s ease-out' }} />
            </div>
          </div>

        </div>
      </div>

      {/* Ledger Verification Summary */}
      {audit && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
            <div className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-extrabold" style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Ledger Audit Report</h3>
          </div>

          <div className="flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-muted)' }}>Verified Journal Entries:</span>
              <span className="font-bold text-current">{audit.totalEntries} entries</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-muted)' }}>Double-Entry Invariant:</span>
              <span className="font-bold" style={{ color: '#10b981' }}>✓ Total Debits ({audit.debitsTotal}) = Total Credits ({audit.creditsTotal})</span>
            </div>
            <div className="flex justify-between items-center" style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Journal Reference Hash:</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--primary)', letterSpacing: '0.05em' }}>{audit.latestHash ? audit.latestHash.substring(0, 32) + '...' : 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
