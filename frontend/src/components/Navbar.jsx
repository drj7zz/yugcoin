import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, UserRound, LogOut, RefreshCw, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.webp';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Wallet', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: UserRound },
];

function BrandMark() {
  return (
    <div className="navbar-brand flex items-center gap-2" style={{ cursor: 'pointer', background: 'transparent', border: 'none' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <img src={logo} alt="YugCoin logo" className="logo-transparent navbar-logo" />
    </div>
  );
}

function TabButton({ item, activeTab, setActiveTab }) {
  const Icon = item.icon;
  return (
    <button className="navbar-tab" data-active={activeTab === item.id} onClick={() => setActiveTab(item.id)}>
      <Icon size={17} />
      <span>{item.label}</span>
    </button>
  );
}

export default function Navbar({ user, activeTab, setActiveTab, onOpenAuth, onLogout, onRefresh }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const initial = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <>
      <nav className="glass-card app-navbar">
        <BrandMark />

        <div className="navbar-content">
          {user ? (
            <>
              <div className="navbar-tabs">
                {NAV_ITEMS.map(item => (
                  <TabButton key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />
                ))}
              </div>

              <div className="navbar-actions" style={{ gap: '0.6rem' }}>
                <button
                  onClick={onRefresh}
                  className="liquid-btn-secondary flex items-center justify-center"
                  title="Refresh balance"
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
                >
                  <RefreshCw size={16} />
                </button>

                <div className="profile-menu" ref={menuRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="navbar-user profile-nav-trigger flex items-center gap-2"
                    onClick={() => setMenuOpen(o => !o)}
                    style={{ background: 'transparent' }}
                  >
                    <div className="flex items-center justify-center font-bold" style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: '#fff' }}>
                      {initial}
                    </div>
                    <div className="flex flex-col" style={{ lineHeight: 1.2, alignItems: 'flex-start' }}>
                      <span className="font-bold" style={{ fontSize: '0.82rem' }}>{user.name}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{user.email}</span>
                    </div>
                    <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>

                  {menuOpen && (
                    <div className="profile-dropdown animate-slide-in" role="menu">
                      <div className="profile-dropdown-head flex flex-col" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{user.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</span>
                      </div>
                      <button type="button" className="profile-dropdown-item flex items-center gap-2" onClick={() => { setMenuOpen(false); setActiveTab('profile'); }}>
                        <UserRound size={15} /> Profile & Security
                      </button>
                      <button type="button" className="profile-dropdown-item flex items-center gap-2" onClick={onRefresh}>
                        <RefreshCw size={15} /> Refresh Balance
                      </button>
                      <button type="button" className="profile-dropdown-item flex items-center gap-2" onClick={() => { setMenuOpen(false); onLogout(); }} style={{ color: 'var(--danger)' }}>
                        <LogOut size={15} /> Log out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-guest-actions navbar-guest-flat" style={{ gap: '0.6rem' }}>
              <button className="navbar-flat-link" onClick={() => onOpenAuth('login')} style={{ fontSize: '0.88rem' }}>
                Sign In
              </button>
              <button className="navbar-flat-link navbar-flat-link-strong" onClick={() => onOpenAuth('register')} style={{ fontSize: '0.88rem' }}>
                Open Wallet
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      {user && (
        <nav className="bottom-nav">
          {NAV_ITEMS.map(item => (
            <TabButton key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />
          ))}
        </nav>
      )}
    </>
  );
}
