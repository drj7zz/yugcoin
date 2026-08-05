import React from 'react';
import { Wallet, BarChart2, LogOut, LogIn, UserPlus, RefreshCw, User, Code2 } from 'lucide-react';
import backgroundImage from '../assets/bg.jpeg';

export default function Navbar({ user, activeTab, setActiveTab, onOpenAuth, onLogout, onRefresh }) {
  return (
    <nav className="glass-card app-navbar">
      <div className="navbar-brand flex items-center gap-4" style={{ cursor: 'pointer' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
          <img src={backgroundImage} alt="YugCoin" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '62% 62%', display: 'block' }} />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-gradient" style={{ fontSize: '1.25rem', lineHeight: '1.2' }}>YugCoin</span>
          <span style={{ fontSize: '0.75rem', opacity: 0.7, letterSpacing: '0.05em' }}>WALLET</span>
        </div>
      </div>

      <div className="navbar-content">
        {user ? (
          <>
            <div className="navbar-tabs flex items-center gap-2" style={{ background: 'rgba(0,0,0,0.05)', padding: '0.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                className="liquid-btn-secondary"
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  background: activeTab === 'dashboard' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: activeTab === 'dashboard' ? 'var(--text-main)' : 'var(--text-muted)'
                }}
                onClick={() => setActiveTab('dashboard')}
              >
                <div className="flex items-center gap-2">
                  <Wallet size={16} /> <span style={{ fontSize: '0.9rem' }}>Dashboard</span>
                </div>
              </button>
              <button
                className="liquid-btn-secondary"
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  background: activeTab === 'insights' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: activeTab === 'insights' ? 'var(--text-main)' : 'var(--text-muted)'
                }}
                onClick={() => setActiveTab('insights')}
              >
                <div className="flex items-center gap-2">
                  <BarChart2 size={16} /> <span style={{ fontSize: '0.9rem' }}>Insights</span>
                </div>
              </button>
              <button
                className="liquid-btn-secondary"
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  background: activeTab === 'open-source' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: activeTab === 'open-source' ? 'var(--text-main)' : 'var(--text-muted)'
                }}
                onClick={() => setActiveTab('open-source')}
              >
                <div className="flex items-center gap-2"><Code2 size={16} /> <span style={{ fontSize: '0.9rem' }}>Open Source</span></div>
              </button>
              <button
                className="liquid-btn-secondary"
                style={{
                  padding: '0.5rem 1rem', border: 'none',
                  background: activeTab === 'profile' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: activeTab === 'profile' ? 'var(--text-main)' : 'var(--text-muted)'
                }}
                onClick={() => setActiveTab('profile')}
              >
                <div className="flex items-center gap-2"><User size={16} /> <span style={{ fontSize: '0.9rem' }}>Profile</span></div>
              </button>
            </div>

            <div className="navbar-actions flex items-center gap-4">
              <button
                onClick={onRefresh}
                className="liquid-btn-secondary flex items-center justify-center"
                title="Refresh Balance"
                style={{ padding: '0.5rem', borderRadius: '50%', border: 'none' }}
              >
                <RefreshCw size={18} />
              </button>

              <button type="button" className="navbar-user profile-nav-trigger flex items-center gap-3" onClick={() => setActiveTab('profile')} title="Open profile and security settings">
                <div className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'var(--text-main)' }}>
                  <User size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold" style={{ fontSize: '0.85rem' }}>{user.name}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{user.walletAddress?.substring(0, 10)}...</span>
                </div>
              </button>

              <button className="liquid-btn-secondary flex items-center justify-center" onClick={onLogout} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)' }} title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="navbar-guest-actions flex items-center gap-3">
            <button className="liquid-btn-secondary flex items-center gap-2" onClick={() => onOpenAuth('login')} style={{ fontSize: '0.9rem' }}>
              <Code2 size={16} /> Open Source
            </button>
            <button className="liquid-btn-secondary flex items-center gap-2" onClick={() => onOpenAuth('login')} style={{ fontSize: '0.9rem' }}>
              <LogIn size={16} /> Sign In
            </button>
            <button className="liquid-btn-primary flex items-center gap-2" onClick={() => onOpenAuth('register')} style={{ fontSize: '0.9rem' }}>
              <UserPlus size={16} /> Open Wallet
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
