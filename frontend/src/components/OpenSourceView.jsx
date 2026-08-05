import React from 'react';
import { BookOpen, Braces, CheckCircle2, Code2, Database, GitBranch, QrCode, Rocket, ShieldCheck, Terminal } from 'lucide-react';

const features = [
  'Google sign-in and signup with server-side credential verification',
  'Password strength and confirmation checks during signup',
  'JWT-based registration and sign-in',
  'Personal YUG wallet balance dashboard',
  'Initial demo balance and wallet-to-wallet transfers',
  'Permanent usernames and YugCoin QR payment profiles for private receiving',
  'Payment reference, transfer PIN, and idempotency protection',
  'Live Socket.io transaction activity',
  'QR payment profile display, camera scanning, and image upload',
  'Downloadable transaction statements and payment receipts',
  'Double-entry ledger records and hash-chain audit endpoint',
  'Responsive dashboard for desktop and mobile'
];

const roadmap = [
  'Optional usernames for private payments and QR requests.',
  'Backend-validated coupons for controlled demo balance rewards.',
  'Payment requests and a contributor quest board for community learning tasks.',
  'KYC-style verification and more robust account controls.',
  'Rewards, coupons, marketplace, and a controlled demo YUG economy.',
  'Public contribution rules, professional documentation, and a mobile app.'
];

const releases = [
  { version: 'v1.0', summary: 'Wallet foundations', items: ['Secure wallet accounts and JWT access.', 'Demo YUG balances, transfers, and double-entry ledger records.'] },
  { version: 'v1.1', summary: 'Payments and account tools', items: ['Permanent usernames and YugCoin QR payment profiles.', 'Profile security, receipts, and downloadable statements.'] },
  { version: 'v1.2.0', summary: 'Safer access and refined experience', items: ['Google sign-in/signup, password strength rules, confirmation, and email/username guidance.', 'Back-button popup fixes, clear send/receive statement context, full themed JPEG statements, and responsive UI improvements.'] }
];

const apiRoutes = [
  ['POST', '/api/auth/register', 'Create a learning wallet account'],
  ['POST', '/api/auth/login', 'Sign in and receive a JWT'],
  ['POST', '/api/auth/google', 'Verify a Google credential and sign in or create a wallet'],
  ['GET', '/api/auth/me', 'Get the current user and wallets'],
  ['GET', '/api/wallet/balances', 'Get wallet balances'],
  ['POST', '/api/wallet/transfer', 'Send simulated YUG to another wallet'],
  ['GET', '/api/wallet/history', 'Get wallet transaction history'],
  ['GET', '/api/wallet/audit', 'Verify ledger hash-chain integrity']
];

export default function OpenSourceView() {
  return (
    <main className="open-source-readme animate-slide-in">
      <section className="glass-card readme-hero">
        <div className="open-source-icon"><Code2 size={28} /></div>
        <div>
          <span className="qr-receive-label">Project documentation</span>
          <h1 className="hero-title" style={{ fontSize: '3rem', marginTop: '0.3rem' }}>YugCoin Wallet</h1>
          <p>A learning-focused digital-wallet dashboard for exploring balances, transfers, QR payments, transaction history, and double-entry ledger concepts.</p>
        </div>
      </section>

      <section className="glass-card readme-section">
        <div className="readme-heading"><BookOpen size={20} /><h2>About YugCoin</h2></div>
          <p>YugCoin is an educational wallet application. It helps learners understand account access, an initial demo YUG balance, transfers, transaction records, QR wallet addresses, and ledger integrity checks.</p>
        <div className="readme-notice"><ShieldCheck size={19} /><span><strong>Learning project only.</strong> YUG is not a real currency. YugCoin does not process real payments and must not be used to store or transfer real funds.</span></div>
      </section>

      <section className="glass-card readme-section">
        <div className="readme-heading"><CheckCircle2 size={20} /><h2>Features</h2></div>
        <ul className="readme-list">{features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
      </section>

      <section className="readme-two-column">
        <article className="glass-card readme-section">
          <div className="readme-heading"><GitBranch size={20} /><h2>Architecture</h2></div>
          <div className="architecture-flow">
            <span>Wallet user</span><b>→</b><span>React dashboard</span><b>→</b><span>Express API</span><b>→</b><span>MongoDB</span>
          </div>
          <p className="readme-small">Socket.io keeps activity live, while the wallet service records each movement in a double-entry ledger with a hash-chain audit.</p>
        </article>
        <article className="glass-card readme-section">
          <div className="readme-heading"><QrCode size={20} /><h2>QR payment flow</h2></div>
          <ol className="readme-list readme-ordered">
            <li>Scan or upload a recipient QR code.</li>
            <li>Return the wallet address to the dashboard.</li>
            <li>Submit the transfer with its PIN confirmation.</li>
            <li>Save transaction and ledger records, then show a receipt.</li>
          </ol>
        </article>
      </section>

      <section className="glass-card readme-section">
        <div className="readme-heading"><Braces size={20} /><h2>Technology</h2></div>
        <div className="tech-grid">
          <div><strong>Frontend</strong><span>React 18, Create React App, CSS, Lucide</span></div>
          <div><strong>QR features</strong><span>qrcode.react, camera API, BarcodeDetector</span></div>
          <div><strong>Backend</strong><span>Node.js, Express, Socket.io</span></div>
          <div><strong>Data & security</strong><span>MongoDB, Mongoose, JWT, bcrypt, transfer PINs</span></div>
        </div>
      </section>

      <section className="glass-card readme-section">
        <div className="readme-heading"><Terminal size={20} /><h2>Run locally</h2></div>
        <p>Use Node.js 18 or newer with npm and a MongoDB database. Configure <code>backend/.env</code> with <code>MONGO_URI</code>, <code>JWT_SECRET</code>, <code>GOOGLE_CLIENT_ID</code>, and an optional <code>PORT</code>.</p>
        <div className="command-grid"><code>cd backend<br />npm install<br />npm start</code><code>cd frontend<br />npm install<br />npm start</code></div>
        <p className="readme-small">For local frontend development, set <code>REACT_APP_API_URL</code> to <code>http://localhost:5000/api</code> and <code>REACT_APP_GOOGLE_CLIENT_ID</code> to the same Google OAuth Web Client ID.</p>
      </section>

      <section className="readme-two-column">
        <article className="glass-card readme-section">
          <div className="readme-heading"><Rocket size={20} /><h2>Release history</h2></div>
          <div className="release-history">{releases.map((release) => <article key={release.version}><strong>{release.version}</strong><span>{release.summary}</span><ul>{release.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div>
          <h3 className="roadmap-title">Upcoming</h3>
          <ul className="readme-list">{roadmap.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="glass-card readme-section">
          <div className="readme-heading"><Database size={20} /><h2>API overview</h2></div>
          <div className="api-list">{apiRoutes.map(([method, route, purpose]) => <div key={route}><b data-method={method}>{method}</b><code>{route}</code><span>{purpose}</span></div>)}</div>
        </article>
      </section>
    </main>
  );
}
