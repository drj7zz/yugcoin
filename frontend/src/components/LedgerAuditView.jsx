import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle, Hash, Database } from 'lucide-react';
import { api } from '../services/api';

export default function LedgerAuditView() {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldCheck size={24} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Double-Entry Ledger Auditor</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Verification of transaction journal balance invariants and chain hash integrity.
          </p>
        </div>

        <button 
          onClick={fetchAudit} 
          className="btn-primary" 
          disabled={loading}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          {loading ? 'Verifying...' : 'Re-verify Ledger'}
        </button>
      </div>

      {audit && (
        <>
          {/* Status Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            
            {/* Hash Chain Integrity */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Journal Entry Integrity
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {audit.isChainValid ? (
                  <>
                    <CheckCircle2 size={28} color="var(--accent-emerald)" />
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>VALID & CONSISTENT</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{audit.totalEntries} journal entries verified</div>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={28} color="var(--accent-rose)" />
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-rose)' }}>DISCREPANCY DETECTED</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Journal hash broken</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Accounting Invariant */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Balance Invariant (Debits = Credits)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={28} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: audit.balanced ? 'var(--accent-cyan)' : 'var(--accent-rose)' }}>
                    {audit.balanced ? 'BALANCED (DEBITS = CREDITS)' : 'UNBALANCED'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Debits: {audit.debitsTotal} | Credits: {audit.creditsTotal}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Journal Records */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Total Recorded Journal Entries
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {audit.totalEntries} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>Entries</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '2px' }}>
                Idempotency Protected
              </div>
            </div>

          </div>

          {/* Latest Journal Hash */}
          <div className="glass-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Hash size={16} color="var(--accent-amber)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Current Journal State Hash</span>
            </div>
            <div className="hash-tag">
              {audit.latestHash}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Ledger Inspection Output</h3>
            {audit.auditLogs.length === 0 ? (
              <div className="glass-panel" style={{ padding: '14px', color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
                ✓ Journal chain verified cleanly. No entry tampering or balance drift detected.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {audit.auditLogs.map((log, idx) => (
                  <div key={idx} style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)', padding: '8px 12px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
