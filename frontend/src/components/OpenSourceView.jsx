import React from 'react';
import { BookOpen, CheckCircle2, Code2, Rocket, Target } from 'lucide-react';

const phases = [
  {
    icon: <BookOpen size={20} />,
    title: 'Phase 1 · Wallet foundation',
    items: ['Learning-focused YUG wallet experience', 'User accounts, secure sign-in, and wallet balances', 'Deposits, transfers, transaction history, and double-entry ledger']
  },
  {
    icon: <CheckCircle2 size={20} />,
    title: 'Phase 2 · Payment experience',
    items: ['Receive QR codes, camera scanning, and QR-image upload', 'Mandatory payment reference and repeat-payment action', 'Closable receipt previews with JPEG download']
  },
  {
    icon: <Rocket size={20} />,
    title: 'Phase 3 · Future roadmap',
    items: ['Optional usernames for private payments', 'Account settings, password/PIN updates, and KYC-style security', 'Rewards, coupons, marketplace, and a controlled demo YUG economy']
  }
];

export default function OpenSourceView() {
  return (
    <div className="flex flex-col gap-6 w-full animate-slide-in">
      <section className="glass-card open-source-hero">
        <div className="open-source-icon"><Code2 size={28} /></div>
        <div>
          <span className="qr-receive-label">Open source journey</span>
          <h1 className="hero-title" style={{ fontSize: '3rem', marginTop: '0.3rem' }}>Built in the open.</h1>
          <p>YugCoin is a learning wallet project that grows in clear, documented phases. Explore what has been built and what is next.</p>
        </div>
      </section>

      <section className="glass-card roadmap-card">
        <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}><Target size={20} color="var(--primary)" /><h2 className="font-bold" style={{ fontSize: '1.2rem' }}>Project phases</h2></div>
        <div className="phase-list">
          {phases.map((phase) => <article className="phase-item" key={phase.title}>
            <div className="phase-icon">{phase.icon}</div>
            <div><h3>{phase.title}</h3><ul>{phase.items.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </article>)}
        </div>
      </section>

      <section className="glass-card roadmap-card">
        <h2 className="font-bold" style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Join the project</h2>
        <p className="open-source-copy">The roadmap, code, and learning goals are designed to be understandable for contributors. Keep YugCoin educational until appropriate financial security and compliance are in place.</p>
      </section>
    </div>
  );
}
