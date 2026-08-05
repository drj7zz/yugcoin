import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import InsightsView from './components/InsightsView';
import AuthModal from './components/AuthModal';
import TransferModal from './components/TransferModal';
import DepositWithdrawModal from './components/DepositWithdrawModal';
import TransactionStatementModal from './components/TransactionStatementModal';
import OpenSourceView from './components/OpenSourceView';
import ProfileView from './components/ProfileView';
import { api } from './services/api';
import { Bell, Info, FolderKanban, Users, Github } from 'lucide-react';

const tabs = new Set(['dashboard', 'insights', 'open-source', 'profile']);

export default function App() {
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    const browserTab = window.history.state?.yugcoinTab;
    const savedTab = sessionStorage.getItem('yugcoin_active_tab');
    return tabs.has(browserTab) ? browserTab : (tabs.has(savedTab) ? savedTab : 'dashboard');
  });

  // Modals
  const [authModal, setAuthModal] = useState(() => {
    try {
      const savedModal = JSON.parse(sessionStorage.getItem('yugcoin_auth_modal') || 'null');
      return savedModal?.open && ['login', 'register'].includes(savedModal.mode) ? savedModal : { open: false, mode: 'login' };
    } catch {
      return { open: false, mode: 'login' };
    }
  });
  const [isLoadingSession, setIsLoadingSession] = useState(() => Boolean(localStorage.getItem('yugcoin_token')));
  const [showSendModal, setShowSendModal] = useState(false);
  const [transferDraft, setTransferDraft] = useState({ destinationAddress: '', amount: '', description: '' });
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Toast notification
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const navigateTab = (tab) => {
    if (!tabs.has(tab) || tab === activeTab) return;
    window.history.pushState({ ...window.history.state, yugcoinTab: tab }, '', window.location.href);
    setActiveTab(tab);
  };

  const pushOverlay = (overlay) => window.history.pushState({ ...window.history.state, yugcoinTab: activeTab, yugcoinOverlay: overlay }, '', window.location.href);
  const clearOverlay = () => {
    if (window.history.state?.yugcoinOverlay) window.history.replaceState({ ...window.history.state, yugcoinOverlay: null }, '', window.location.href);
  };
  const openAuth = (mode) => { pushOverlay('auth'); setAuthModal({ open: true, mode }); };
  const closeAuth = () => { clearOverlay(); setAuthModal({ open: false, mode: 'login' }); };
  const openSend = () => { pushOverlay('send'); setShowSendModal(true); };
  const closeSend = () => { clearOverlay(); setShowSendModal(false); setTransferDraft({ destinationAddress: '', amount: '', description: '' }); };
  const openCoupon = () => { pushOverlay('coupon'); setShowCouponModal(true); };
  const closeCoupon = () => { clearOverlay(); setShowCouponModal(false); };
  const openStatement = (transaction) => { pushOverlay('statement'); setCompletedTransaction(transaction); };
  const closeStatement = () => { clearOverlay(); setCompletedTransaction(null); };

  useEffect(() => {
    sessionStorage.setItem('yugcoin_active_tab', activeTab);
    if (!window.history.state?.yugcoinTab) {
      window.history.replaceState({ ...window.history.state, yugcoinTab: activeTab }, '', window.location.href);
    }
  }, [activeTab]);

  useEffect(() => {
    if (authModal.open) sessionStorage.setItem('yugcoin_auth_modal', JSON.stringify(authModal));
    else sessionStorage.removeItem('yugcoin_auth_modal');
  }, [authModal]);

  useEffect(() => {
    const restoreTab = (event) => {
      // Dashboard overlays own local state, so they need an explicit close
      // signal when the browser Back button restores the page underneath.
      setAuthModal({ open: false, mode: 'login' });
      setShowSendModal(false);
      setShowCouponModal(false);
      setCompletedTransaction(null);
      setTransferDraft({ destinationAddress: '', amount: '', description: '' });
      window.dispatchEvent(new Event('yugcoin:close-overlay'));
      const tab = event.state?.yugcoinTab;
      setActiveTab(tabs.has(tab) ? tab : 'dashboard');
    };
    window.addEventListener('popstate', restoreTab);
    return () => window.removeEventListener('popstate', restoreTab);
  }, []);

  const loadUserData = async () => {
    const token = localStorage.getItem('yugcoin_token');
    if (!token) {
      setUser(null);
      setWallets([]);
      setHistory([]);
      setIsLoadingSession(false);
      return;
    }

    try {
      const profileRes = await api.getProfile();
      if (profileRes.success) {
        setUser(profileRes.user);
        setWallets(profileRes.wallets || []);

        const historyRes = await api.getHistory();
        if (historyRes.success) {
          setHistory(historyRes.history || []);
        }
      } else {
        localStorage.removeItem('yugcoin_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user data', err);
    } finally {
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Socket Connection
  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'https://yugcoin-backend.onrender.com';
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    if (user?.walletAddress) {
      socket.emit('join_wallet', user.walletAddress);
    }

    socket.on('wallet_update', (data) => {
      addToast(`Ledger Sync: ${data.type} (${data.amount} YUG)`, 'success');
      loadUserData();
    });

    return () => socket.disconnect();
  }, [user?.walletAddress]);

  const handleLogout = () => {
    localStorage.removeItem('yugcoin_token');
    setUser(null);
    setWallets([]);
    setHistory([]);
    addToast('Signed out', 'info');
  };

  return (
    <div className="max-w-container">

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast glass-card">
            <Bell size={18} color="var(--primary)" />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={navigateTab}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
        onRefresh={loadUserData}
      />

      {/* Main Content Area */}
      {isLoadingSession ? (
        <div className="session-loading glass-card animate-slide-in">Restoring your wallet session…</div>
      ) : !user ? (
        <div className="flex flex-col items-center justify-center mt-8">
          <div className="glass-card landing-hero-content animate-slide-in w-full">

            <div className="flex flex-col items-center gap-4">
              <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: 1.1 }}>
                The Future of Digital Assets
              </h1>
              <p style={{ fontSize: '1.25rem', opacity: 0.85, maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                YugCoin makes moving money more transparent, secure, and easier to understand.
              </p>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button className="liquid-btn-primary" style={{ fontSize: '1.1rem' }} onClick={() => openAuth('register')}>
                Get Started Now
              </button>
              <button className="liquid-btn-secondary" style={{ fontSize: '1.1rem' }} onClick={() => openAuth('login')}>
                Access Wallet
              </button>
            </div>

            <section className="project-journey mt-8">
              <div className="flex items-center justify-between gap-4" style={{ flexWrap: 'wrap' }}>
                <div><span className="qr-receive-label">YugCoin journey</span><h2 className="font-bold" style={{ fontSize: '1.45rem', marginTop: '0.35rem' }}>A wallet built for learning, growing, and sharing.</h2></div>
                <span className="journey-badge">Open source roadmap</span>
              </div>
              <div className="journey-grid">
                <div><strong>v1.0</strong><p>Secure wallet accounts, YUG balances, transfers, and a transparent double-entry ledger.</p></div>
                <div><strong>v1.1</strong><p>Username payments, YugCoin QR profiles, account security, payment receipts, and downloadable statements.</p></div>
                <div><strong>Upcoming</strong><p>Validated coupon rewards, payment requests, a contributor quest board, and a YUG marketplace.</p></div>
              </div>
              <p className="journey-note">Sign in to explore the complete project documentation and roadmap.</p>
            </section>

            <div className="landing-info-grid mt-8">
              <section className="feature-card landing-info-card">
                <div className="feature-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.2)', color: 'var(--primary)' }}>
                  <Info size={32} />
                </div>
                <h2 className="font-bold" style={{ fontSize: '1.25rem' }}>About YugCoin</h2>
                <p>YugCoin is a digital wallet platform created for visitors, learners, and contributors who want a clear, practical way to explore digital money movement.</p>
              </section>

              <section className="feature-card landing-info-card">
                <div className="feature-icon-wrapper" style={{ background: 'rgba(148, 163, 184, 0.18)', color: 'var(--text-main)' }}>
                  <FolderKanban size={32} />
                </div>
                <h2 className="font-bold" style={{ fontSize: '1.25rem' }}>The Project</h2>
                <p>Create a wallet, follow your balance, make username-based transfers, redeem future coupons, and see your activity in one approachable experience.</p>
              </section>

              <section className="feature-card landing-info-card">
                <div className="feature-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.16)', color: '#86efac' }}>
                  <Users size={32} />
                </div>
                <h2 className="font-bold" style={{ fontSize: '1.25rem' }}>Developers</h2>
                <p>Built by people who value learning, clarity, and meaningful collaboration.</p>
                <div className="developer-links">
                  <a href="https://github.com/drj7zz" target="_blank" rel="noreferrer" aria-label="View drj7zz on GitHub">
                    <Github size={16} />
                    <span><small>GitHub</small>drj7zz</span>
                  </a>
                  <a href="https://github.com/coder-khushi" target="_blank" rel="noreferrer" aria-label="View coder-khushi on GitHub">
                    <Github size={16} />
                    <span><small>GitHub</small>coder-khushi</span>
                  </a>
                </div>
              </section>
            </div>

            {/* Project contact */}
            <div className="flex flex-col items-center mt-8 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: '0.9rem', opacity: 0.6, fontWeight: 500 }}>Questions, collaboration, or project inquiries?</p>
              <a href="mailto:giridirghraj@gmail.com" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, marginTop: '4px', textDecoration: 'underline' }}>giridirghraj@gmail.com</a>
            </div>

          </div>
        </div>
      ) : (
        <div className="w-full" style={{ flex: 1 }}>
          {activeTab === 'dashboard' && (
            <Dashboard
              user={user}
              wallets={wallets}
              history={history}
              onOpenSend={() => {
                setTransferDraft({ destinationAddress: '', amount: '', description: '' });
                openSend();
              }}
              onOpenCoupon={openCoupon}
              onNavigateInsights={() => navigateTab('insights')}
              onNavigateProfile={() => navigateTab('profile')}
              onScanRecipient={(address) => {
                setTransferDraft({ destinationAddress: address, amount: '', description: '' });
                openSend();
              }}
              onRedoPayment={(draft) => {
                setTransferDraft(draft);
                openSend();
              }}
            />
          )}

          {activeTab === 'insights' && <InsightsView history={history} wallets={wallets} />}
          {activeTab === 'open-source' && <OpenSourceView />}
          {activeTab === 'profile' && <ProfileView user={user} />}
        </div>
      )}

      {/* Modals */}
      {authModal.open && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={closeAuth}
          onSuccess={(loggedUser, initialTransaction) => {
            closeAuth();
            loadUserData();
            addToast(`Welcome, ${loggedUser.name}`, 'success');
            if (initialTransaction) openStatement(initialTransaction);
          }}
        />
      )}

      {showSendModal && (
          <TransferModal
            wallets={wallets}
            initialDestinationAddress={transferDraft.destinationAddress}
            initialAmount={transferDraft.amount}
            initialDescription={transferDraft.description}
            onClose={closeSend}
          onSuccess={(msg, transaction) => {
            addToast(msg, 'success');
            closeSend();
            openStatement(transaction);
            loadUserData();
          }}
        />
      )}

      {showCouponModal && (
        <DepositWithdrawModal
          onClose={closeCoupon}
          onSuccess={(msg, transaction) => {
            addToast(msg, 'success');
            closeCoupon();
            if (transaction) openStatement(transaction);
            loadUserData();
          }}
        />
      )}

      {completedTransaction && (
        <TransactionStatementModal
          transaction={completedTransaction}
          walletAddress={user?.walletAddress}
          user={user}
          onClose={closeStatement}
          onRedo={(draft) => {
            closeStatement();
            setTransferDraft(draft);
            openSend();
          }}
        />
      )}

    </div>
  );
}
