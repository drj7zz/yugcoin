import React from 'react';
import { BookOpen, Code2, ShieldCheck, HelpCircle, Github, Mail, ExternalLink, Globe } from 'lucide-react';

const PAGES = {
  about: {
    icon: BookOpen,
    title: 'About',
    intro: 'YugCoin is an educational wallet application. It helps learners understand the building blocks of a digital wallet: account access, YUG balances, simulated deposits and transfers, transaction records, QR wallet addresses, and ledger integrity checks.',
    notice: 'Learning project only: YUG is not a real currency. YugCoin does not process real payments and must not be used to store or transfer real funds.',
    sections: [
      {
        heading: 'What you get',
        items: [
          'Email/password and Google sign-in with strong password rules',
          'A personal YUG wallet with a fixed initial demo balance',
          'Wallet-to-wallet transfers with payment notes and transfer PIN confirmation',
          'Permanent usernames so you can receive payments without sharing wallet IDs',
          'Live transaction activity via Socket.io, with receipts you can export as JPEG',
          'A cryptographic hash-chain ledger you can audit for integrity',
        ],
      },
      {
        heading: 'How it works',
        items: [
          'The React dashboard talks to an Express wallet API over REST with JWT auth',
          'Every movement is recorded in a double-entry ledger backed by MongoDB',
          'Socket.io pushes live ledger updates to your dashboard in real time',
        ],
      },
    ],
    links: [
      { href: 'https://github.com/drj7zz/yugcoin', label: 'Source code on GitHub', icon: Github },
      { href: 'https://yugcoin-frontend.onrender.com', label: 'Live app', icon: Globe },
    ],
  },
  contribute: {
    icon: Code2,
    title: 'Contribute',
    intro: 'YugCoin is built in the open. Clone the repo, pick an issue, and open a pull request — bug fixes, UI polish and wallet features are all welcome.',
    sections: [
      {
        heading: 'Getting started',
        items: [
          'Fork the repository at github.com/drj7zz/yugcoin',
          'Run the backend: cd backend, npm install, create .env from .env.example, npm start',
          'Run the frontend: cd frontend, npm install, create .env with the Google client ID and API URL, npm start',
          'Run backend tests: cd backend, npm test',
        ],
      },
      {
        heading: 'Good first areas',
        items: [
          'Frontend polish: dashboard visuals, charts, and wallet insights',
          'Backend: coupon rewards, reusable payment requests, marketplace endpoints',
          'Docs: keep the README and API examples accurate as features land',
        ],
      },
      {
        heading: 'Roadmap highlights',
        items: [
          'Backend-validated coupon rewards and reusable payment requests',
          'YUG marketplace on top of the controlled demo economy',
          'KYC-style verification and an improved account/security page',
        ],
      },
    ],
    links: [
      { href: 'https://github.com/drj7zz/yugcoin', label: 'Open issues & PRs', icon: Github },
      { href: 'mailto:giridirghraj@gmail.com', label: 'Email the team', icon: Mail },
    ],
  },
  privacy: {
    icon: ShieldCheck,
    title: 'Privacy & Security',
    intro: 'Your wallet data stays yours. YugCoin is a learning project, but it still treats security seriously.',
    sections: [
      {
        heading: 'What we protect',
        items: [
          'Balances and transactions are visible only to your authenticated account',
          'Every endpoint requires an Authorization: Bearer JWT token',
          'Transfers require your 4-digit transfer PIN and are idempotency-protected',
          'Passwords are hashed with bcrypt; the ledger is a verifiable hash chain',
        ],
      },
      {
        heading: 'What stays on your device',
        items: [
          'Your sign-in session token is stored locally in your browser',
          "Your remembered email (if you tick 'Remember me') is stored locally only",
        ],
      },
      {
        heading: 'What we never do',
        items: [
          'No real payments, no real currency, no third-party payment processing',
          'No sale or sharing of wallet data — the dataset is for learning only',
        ],
      },
    ],
    links: [
      { href: 'https://github.com/drj7zz/yugcoin#readme', label: 'Full documentation', icon: ExternalLink },
    ],
  },
  help: {
    icon: HelpCircle,
    title: 'Help & FAQ',
    intro: 'New here? This quick guide gets you from zero to your first YUG payment.',
    sections: [
      {
        heading: 'Getting started',
        items: [
          'Create a wallet with your email or Google account — you get a demo YUG balance instantly',
          'Your username (like @you) is permanent and is how others can pay you',
          'Set a 4-digit transfer PIN when you register; you will need it for every send',
        ],
      },
      {
        heading: 'Sending & receiving',
        items: [
          'Send: hit Send, enter a @username or wallet ID, an amount, a note, and your PIN',
          'Receive: share your My Code QR or your @username — never share your PIN',
          'Scan: use Scan in the wallet footer to read a friend\u2019s QR with your camera, or upload a QR image',
        ],
      },
      {
        heading: 'Troubleshooting',
        items: [
          'Transfers fail without the exact 4-digit PIN — check it in Profile & Security',
          'Passwords need 8+ characters with uppercase, lowercase and a number',
          'QR scanning needs camera permission; upload-a-QR always works as a fallback',
        ],
      },
    ],
    links: [
      { href: 'https://github.com/drj7zz/yugcoin#qr-scanner-notes', label: 'QR scanner notes', icon: ExternalLink },
      { href: 'mailto:giridirghraj@gmail.com', label: 'Contact support', icon: Mail },
    ],
  },
};

export default function InfoView({ topic, onOpenAuth }) {
  const page = PAGES[topic] || PAGES.about;
  const Icon = page.icon;

  return (
    <div className="info-view page-enter animate-slide-in">
      <section className="glass-card info-hero">
        <div className="info-hero-icon"><Icon size={26} /></div>
        <div>
          <span className="qr-receive-label">YugCoin</span>
          <h1 className="hero-title" style={{ fontSize: '2.4rem', marginTop: '0.25rem' }}>{page.title}</h1>
          <p className="info-intro">{page.intro}</p>
        </div>
      </section>

      {page.notice && (
        <section className="info-notice">{page.notice}</section>
      )}

      {page.sections.map(section => (
        <section className="glass-card info-section" key={section.heading}>
          <h2>{section.heading}</h2>
          <ul>
            {section.items.map(item => <li key={item}>{item}</li>)}
          </ul>
        </section>
      ))}

      {page.links?.length > 0 && (
        <section className="glass-card info-section">
          <h2>Useful links</h2>
          <div className="info-links">
            {page.links.map(link => {
              const LinkIcon = link.icon || ExternalLink;
              return (
                <a key={link.href + link.label} href={link.href} target="_blank" rel="noreferrer" className="info-link">
                  <LinkIcon size={16} /> {link.label}
                </a>
              );
            })}
          </div>
        </section>
      )}

      <p className="info-footer-note">YugCoin © {new Date().getFullYear()} · Learning project · YUG is not a real currency</p>
    </div>
  );
}
