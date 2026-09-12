import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import InfoView from './components/InfoView';
import TransferModal from './components/TransferModal';
import DepositWithdrawModal from './components/DepositWithdrawModal';
import TransactionStatementModal from './components/TransactionStatementModal';
import ProfileView from './components/ProfileView';
import { api, SOCKET_URL } from './services/api';
import { PageSkeleton } from './components/Skeleton';
import { Bell } from 'lucide-react';

const TAB_ROUTES = ['dashboard', 'profile'];

function AppShell() {
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [history, setHistory] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = TAB_ROUTES.includes(location.pathname.split('/')[1]) ? location.pathname.split('/')[1] : 'dashboard';
  const navigateTab = (tab) => navigate(`/${tab}`);

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

  const openAuth = () => navigate('/login');
  const closeSend = () => { setShowSendModal(false); setTransferDraft({ destinationAddress: '', amount: '', description: '' }); };
  const closeCoupon = () => setShowCouponModal(false);

  const openStatement = (transaction) => setCompletedTransaction(transaction);
  const closeStatement = () => setCompletedTransaction(null);
  const openSend = () => { setTransferDraft({ destinationAddress: '', amount: '', description: '' }); setShowSendModal(true); };
  const openCoupon = () => setShowCouponModal(true);

  const handleAuthSuccess = (loggedUser, initialTransaction) => {
    // Optimistically switch to the wallet immediately — no manual refresh needed.
    setUser(loggedUser);
    if (initialTransaction) setCompletedTransaction(initialTransaction);
    navigate('/dashboard', { replace: true });
    loadUserData();
  };

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
    const socketUrl = SOCKET_URL;
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
    navigate('/login');
  };

  const showNav = true;

  return (
    <div className="max-w-container">

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <Bell size={18} color="var(--primary)" />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Navbar */}
      {showNav && (
        <Navbar
          user={user}
          activeTab={activeTab}
          setActiveTab={navigateTab}
          onOpenAuth={openAuth}
          onLogout={handleLogout}
          onRefresh={loadUserData}
        />
      )}

      {/* Main Content Area — URL routes */}
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" onSuccess={handleAuthSuccess} user={user} />} />
        <Route path="/register" element={<AuthPage mode="register" onSuccess={handleAuthSuccess} user={user} />} />

        {isLoadingSession ? (
          <Route path="*" element={<div className="flex flex-col page-enter" style={{ maxWidth: 480, margin: '2.5rem auto 0', padding: '0 1rem' }}><PageSkeleton /></div>} />
        ) : !user ? (
          <>
            <Route path="/" element={<LandingPage onOpenAuth={openAuth} />} />
            <Route path="/info/:topic" element={<InfoView topic={location.pathname.split('/')[2]} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <Dashboard
                user={user}
                wallets={wallets}
                history={history}
                onOpenSend={openSend}
                onOpenCoupon={openCoupon}
                onRefresh={loadUserData}
                onNavigateProfile={() => navigateTab('profile')}
                onScanRecipient={(address) => {
                  setTransferDraft({ destinationAddress: address, amount: '', description: '' });
                  setShowSendModal(true);
                }}
                onRedoPayment={(draft) => {
                  setTransferDraft(draft);
                  setShowSendModal(true);
                }}
              />
            } />
            <Route path="/profile" element={<ProfileView user={user} onLogout={handleLogout} />} />
            <Route path="/info/:topic" element={<InfoView topic={location.pathname.split('/')[2]} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>

      {/* Modals */}
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

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

/* ---------- URL-routed pages ---------- */

function LandingPage({ onOpenAuth }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 9rem)' }}>
      <div className="landing-hero-content animate-slide-in w-full">
        <div className="flex flex-col items-center gap-4">
          <h1 className="hero-title" style={{ fontSize: '3.2rem', lineHeight: 1.12 }}>
            Money, made simple.
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '560px', margin: '0 auto', lineHeight: 1.65 }}>
            YugCoin is a digital wallet — send, receive, and track your balance with receipts for every payment. No noise, just your money.
          </p>
        </div>

        <div className="landing-cta mt-8">
          <button className="liquid-btn-primary" onClick={() => onOpenAuth('login')}>Open Your Wallet</button>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2.5rem' }}>
          Free to use · Google sign-in · Learning project — YUG is not a real currency
        </p>
      </div>
    </div>
  );
}

function AuthPage({ mode, onSuccess }) {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <AuthModal
        key={mode}
        initialMode={mode}
        onClose={() => navigate('/')}
        onSuccess={(loggedUser, initialTransaction) => {
          if (initialTransaction) onSuccess(loggedUser, initialTransaction);
          else onSuccess(loggedUser, null);
        }}
        onModeSwitch={(nextMode) => navigate(nextMode === 'login' ? '/login' : '/register')}
      />
    </div>
  );
}
