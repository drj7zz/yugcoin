import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import InsightsView from './components/InsightsView';
import AuthModal from './components/AuthModal';
import TransferModal from './components/TransferModal';
import DepositWithdrawModal from './components/DepositWithdrawModal';
import { api } from './services/api';
import { Bell } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modals
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Toast notification
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const loadUserData = async () => {
    const token = localStorage.getItem('yugcoin_token');
    if (!token) {
      setUser(null);
      setWallets([]);
      setHistory([]);
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
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Socket Connection
  useEffect(() => {
    const defaultSocketUrl = window.location.hostname === 'localhost' ? '/' : 'https://yugcoin-backend.onrender.com';
    const socketUrl = import.meta.env.VITE_SOCKET_URL || defaultSocketUrl;
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
    <div className="app-container">
      
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <Bell size={15} color="#38bdf8" />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
        onLogout={handleLogout}
        onRefresh={loadUserData}
      />

      {/* Main Content Area */}
      {!user ? (
        <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, color: 'var(--text-main)' }}>
            Digital Wallet & Ledger
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px', lineHeight: 1.5 }}>
            A minimal, authentic digital wallet. Features real-time balance tracking, instant transfers, and balance audits.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button className="btn-primary" onClick={() => setAuthModal({ open: true, mode: 'register' })} style={{ padding: '10px 20px' }}>
              Create Account
            </button>
            <button className="btn-secondary" onClick={() => setAuthModal({ open: true, mode: 'login' })} style={{ padding: '10px 20px' }}>
              Sign In
            </button>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <Dashboard
              user={user}
              wallets={wallets}
              history={history}
              onOpenSend={() => setShowSendModal(true)}
              onOpenDeposit={() => setShowDepositModal(true)}
              onNavigateInsights={() => setActiveTab('insights')}
            />
          )}

          {activeTab === 'insights' && <InsightsView history={history} wallets={wallets} />}
        </>
      )}

      {/* Modals */}
      {authModal.open && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'login' })}
          onSuccess={(loggedUser) => {
            setAuthModal({ open: false, mode: 'login' });
            loadUserData();
            addToast(`Welcome, ${loggedUser.name}`, 'success');
          }}
        />
      )}

      {showSendModal && (
        <TransferModal
          wallets={wallets}
          onClose={() => setShowSendModal(false)}
          onSuccess={(msg) => {
            addToast(msg, 'success');
            loadUserData();
          }}
        />
      )}

      {showDepositModal && (
        <DepositWithdrawModal
          onClose={() => setShowDepositModal(false)}
          onSuccess={(msg) => {
            addToast(msg, 'success');
            loadUserData();
          }}
        />
      )}

    </div>
  );
}
