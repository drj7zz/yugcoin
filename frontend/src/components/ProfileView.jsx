import React, { useState } from 'react';
import { AtSign, Check, CheckCircle2, ChevronDown, Copy, Fingerprint, KeyRound, LockKeyhole, LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function CollapseSection({ icon: Icon, title, subtitle, open, onToggle, children }) {
  return (
    <section className="glass-card profile-section profile-collapse" data-open={open}>
      <button type="button" className="profile-collapse-head" onClick={onToggle} aria-expanded={open}>
        <span className="profile-collapse-icon"><Icon size={18} /></span>
        <span className="profile-collapse-text">
          <h2>{title}</h2>
          {subtitle && <span className="profile-section-sub">{subtitle}</span>}
        </span>
        <ChevronDown size={18} className="profile-collapse-chevron" />
      </button>
      <div className="profile-collapse-body" data-open={open}>
        <div className="profile-collapse-inner">{children}</div>
      </div>
    </section>
  );
}

function Notice({ message, type }) {
  if (!message) return null;
  const success = type === 'success';
  return <div className="profile-notice" data-success={success}>{success ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />} {message}</div>;
}

export default function ProfileView({ user, onLogout }) {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(null); // 'password' | 'pin' | null
  const toggleSection = (key) => setOpenSection((prev) => (prev === key ? null : key));
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [pins, setPins] = useState({ current: '', next: '', confirm: '' });
  const [passwordNotice, setPasswordNotice] = useState({ message: '', type: '' });
  const [pinNotice, setPinNotice] = useState({ message: '', type: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPin, setSavingPin] = useState(false);

  const updatePassword = async (event) => {
    event.preventDefault();
    setPasswordNotice({ message: '', type: '' });
    if (passwords.next !== passwords.confirm) return setPasswordNotice({ message: 'New password confirmation does not match.', type: 'error' });
    setSavingPassword(true);
    try {
      const response = await api.changePassword(passwords.current, passwords.next);
      setPasswordNotice({ message: response.message, type: 'success' });
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (error) {
      setPasswordNotice({ message: error.message, type: 'error' });
    } finally { setSavingPassword(false); }
  };

  const updatePin = async (event) => {
    event.preventDefault();
    setPinNotice({ message: '', type: '' });
    if (pins.next !== pins.confirm) return setPinNotice({ message: 'New PIN confirmation does not match.', type: 'error' });
    setSavingPin(true);
    try {
      const response = await api.changeSecurityPin(pins.current, pins.next);
      setPinNotice({ message: response.message, type: 'success' });
      setPins({ current: '', next: '', confirm: '' });
    } catch (error) {
      setPinNotice({ message: error.message, type: 'error' });
    } finally { setSavingPin(false); }
  };

  const username = user?.username || user?.email?.split('@')[0] || 'Not available';
  const displayName = user?.name || 'Your profile';
  const [copiedId, setCopiedId] = useState(false);

  const logout = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  const copyWalletId = () => {
    if (!user?.walletAddress) return;
    navigator.clipboard.writeText(user.walletAddress);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const initial = displayName.charAt(0).toUpperCase();

  return <main className="profile-view animate-slide-in">
    {/* Standard settings header */}
    <header className="profile-header">
      <div className="profile-header-avatar font-bold">{initial}</div>
      <div>
        <h1 style={{ fontSize: '1.35rem', lineHeight: 1.2 }}>{displayName}</h1>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>@{username} · Profile & Security</span>
      </div>
    </header>

    <div className="profile-layout">
      {/* Sidebar account summary */}
      <aside className="glass-card profile-side">
        <div className="profile-side-avatar"><UserRound size={26} /></div>
        <strong style={{ fontSize: '1rem' }}>{displayName}</strong>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email || '—'}</span>
        <span className="profile-side-badge"><ShieldCheck size={14} /> Secured account</span>

        <div className="profile-side-facts">
          <div className="profile-fact"><AtSign size={14} /><div><small>Username</small><span>@{username}</span></div></div>
          <div className="profile-fact"><Mail size={14} /><div><small>Email</small><span>{user?.email || '—'}</span></div></div>
          <div className="profile-fact">
            <Fingerprint size={14} />
            <div style={{ minWidth: 0 }}><small>Wallet ID</small>
              <span className="profile-fact-copy">
                <span className="profile-dd-mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.walletAddress || '—'}</span>
                <button type="button" onClick={copyWalletId} title="Copy wallet ID" aria-label="Copy wallet ID">
                  {copiedId ? <Check size={13} color="var(--primary)" /> : <Copy size={13} />}
                </button>
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main settings column */}
      <div className="profile-main">
        <section className="glass-card profile-section">
          <div className="profile-section-head"><UserRound size={18} /><h2>Identity</h2></div>
          <p className="profile-section-sub">Set when the wallet was created. These details cannot be changed.</p>
          <dl className="profile-rows">
            <div><dt>Full name</dt><dd>{user?.name || '—'}</dd></div>
            <div><dt>Email address</dt><dd>{user?.email || '—'}</dd></div>
            <div><dt>Username</dt><dd className="profile-dd-accent">@{username}</dd></div>
            <div><dt>Wallet ID</dt><dd className="profile-dd-mono">{user?.walletAddress || '—'}</dd></div>
          </dl>
        </section>

        <CollapseSection
          icon={LockKeyhole}
          title="Change password"
          subtitle="Confirm your current password to set a new one (8+ characters)."
          open={openSection === 'password'}
          onToggle={() => toggleSection('password')}
        >
          <Notice {...passwordNotice} />
          <form onSubmit={updatePassword} className="profile-form">
            <input className="liquid-input" type="password" autoComplete="current-password" placeholder="Current password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required />
            <input className="liquid-input" type="password" autoComplete="new-password" placeholder="New password" minLength="8" value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} required />
            <input className="liquid-input" type="password" autoComplete="new-password" placeholder="Confirm new password" minLength="8" value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} required />
            <button className="liquid-btn-primary" disabled={savingPassword}>{savingPassword ? 'Updating password…' : 'Update password'}</button>
          </form>
        </CollapseSection>

        <CollapseSection
          icon={KeyRound}
          title="Security PIN"
          subtitle="Required to confirm every transfer. Exactly 4 digits."
          open={openSection === 'pin'}
          onToggle={() => toggleSection('pin')}
        >
          <Notice {...pinNotice} />
          <form onSubmit={updatePin} className="profile-form">
            <input className="liquid-input" type="password" inputMode="numeric" autoComplete="off" maxLength="4" pattern="[0-9]{4}" placeholder="Current 4-digit PIN" value={pins.current} onChange={(event) => setPins({ ...pins, current: event.target.value.replace(/\D/g, '') })} required />
            <input className="liquid-input" type="password" inputMode="numeric" autoComplete="new-password" maxLength="4" pattern="[0-9]{4}" placeholder="New 4-digit PIN" value={pins.next} onChange={(event) => setPins({ ...pins, next: event.target.value.replace(/\D/g, '') })} required />
            <input className="liquid-input" type="password" inputMode="numeric" autoComplete="new-password" maxLength="4" pattern="[0-9]{4}" placeholder="Confirm new PIN" value={pins.confirm} onChange={(event) => setPins({ ...pins, confirm: event.target.value.replace(/\D/g, '') })} required />
            <button className="liquid-btn-primary" disabled={savingPin}>{savingPin ? 'Updating PIN…' : 'Update security PIN'}</button>
          </form>
        </CollapseSection>

        <section className="glass-card profile-section profile-danger-zone">
          <div className="profile-section-head"><LogOut size={18} /><h2>Session</h2></div>
          <p className="profile-section-sub">Sign out of YugCoin on this device. You can sign back in anytime.</p>
          <button type="button" className="profile-logout-btn" onClick={logout}>
            <LogOut size={16} /> Log out
          </button>
        </section>
      </div>
    </div>
  </main>;
}
