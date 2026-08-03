import React from 'react';
import { Wallet, BarChart2, LogOut, LogIn, UserPlus, RefreshCw, User } from 'lucide-react';

export default function Navbar({ user, activeTab, setActiveTab, onOpenAuth, onLogout, onRefresh }) {
  return (
    <nav className="navbar">
      <div className="brand">
        <div className="brand-icon">
          <Wallet size={18} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>YugCoin Wallet</span>
        </div>
      </div>

      {user ? (
        <>
          <div className="nav-links">
            <button
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Wallet size={15} /> Dashboard
            </button>
            <button
              className={`nav-btn ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              <BarChart2 size={15} /> Insights & Audit
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={onRefresh} 
              className="close-btn" 
              title="Refresh Balance" 
              style={{ padding: '6px' }}
            >
              <RefreshCw size={15} />
            </button>
            
            {/* Circular Profile Avatar */}
            <div className="user-profile-group">
              <div className="user-avatar-circle" title={user.name}>
                <User size={18} />
              </div>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-address">{user.walletAddress}</span>
              </div>
            </div>

            <button className="nav-btn" onClick={onLogout} style={{ color: '#ef4444' }}>
              <LogOut size={15} />
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => onOpenAuth('login')}>
            <LogIn size={15} /> Sign In
          </button>
          <button className="btn-primary" onClick={() => onOpenAuth('register')}>
            <UserPlus size={15} /> Open Wallet
          </button>
        </div>
      )}
    </nav>
  );
}
