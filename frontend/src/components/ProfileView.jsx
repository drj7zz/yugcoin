import React, { useState } from 'react';
import { CheckCircle2, KeyRound, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { api } from '../services/api';

function Notice({ message, type }) {
  if (!message) return null;
  const success = type === 'success';
  return <div className="profile-notice" data-success={success}>{success ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />} {message}</div>;
}

export default function ProfileView({ user }) {
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

  return <main className="profile-view animate-slide-in">
    <section className="glass-card profile-hero">
      <div className="profile-avatar"><UserRound size={28} /></div>
      <div><span className="qr-receive-label">Account settings</span><h1 className="hero-title" style={{ fontSize: '3rem', marginTop: '0.3rem' }}>{displayName}</h1><p className="profile-identity"><span>@{username}</span><span>{user?.walletAddress || 'Wallet ID unavailable'}</span></p></div>
    </section>
    <section className="glass-card profile-details-card">
      <div className="readme-heading"><UserRound size={20} /><h2>Account details</h2></div>
      <p>These identity details are set when the wallet is created and cannot be changed.</p>
      <dl className="profile-details">
        <div><dt>Full name</dt><dd>{user?.name || '—'}</dd></div>
        <div><dt>Email address</dt><dd>{user?.email || '—'}</dd></div>
        <div><dt>Username</dt><dd>@{username}</dd></div>
        <div><dt>Wallet ID</dt><dd>{user?.walletAddress || '—'}</dd></div>
      </dl>
    </section>
    <div className="profile-grid">
      <section className="glass-card profile-card">
        <div className="readme-heading"><LockKeyhole size={20} /><h2>Change password</h2></div>
        <p>Confirm your current password before choosing a new password of at least 8 characters.</p>
        <Notice {...passwordNotice} />
        <form onSubmit={updatePassword} className="profile-form">
          <input className="liquid-input" type="password" autoComplete="current-password" placeholder="Current password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required />
          <input className="liquid-input" type="password" autoComplete="new-password" placeholder="New password" minLength="8" value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} required />
          <input className="liquid-input" type="password" autoComplete="new-password" placeholder="Confirm new password" minLength="8" value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} required />
          <button className="liquid-btn-primary" disabled={savingPassword}>{savingPassword ? 'Updating password…' : 'Update password'}</button>
        </form>
      </section>
      <section className="glass-card profile-card">
        <div className="readme-heading"><KeyRound size={20} /><h2>Change security PIN</h2></div>
        <p>Your PIN is required to confirm transfers. It must contain exactly four digits.</p>
        <Notice {...pinNotice} />
        <form onSubmit={updatePin} className="profile-form">
          <input className="liquid-input" type="password" inputMode="numeric" autoComplete="off" maxLength="4" pattern="[0-9]{4}" placeholder="Current 4-digit PIN" value={pins.current} onChange={(event) => setPins({ ...pins, current: event.target.value.replace(/\D/g, '') })} required />
          <input className="liquid-input" type="password" inputMode="numeric" autoComplete="new-password" maxLength="4" pattern="[0-9]{4}" placeholder="New 4-digit PIN" value={pins.next} onChange={(event) => setPins({ ...pins, next: event.target.value.replace(/\D/g, '') })} required />
          <input className="liquid-input" type="password" inputMode="numeric" autoComplete="new-password" maxLength="4" pattern="[0-9]{4}" placeholder="Confirm new PIN" value={pins.confirm} onChange={(event) => setPins({ ...pins, confirm: event.target.value.replace(/\D/g, '') })} required />
          <button className="liquid-btn-primary" disabled={savingPin}>{savingPin ? 'Updating PIN…' : 'Update security PIN'}</button>
        </form>
      </section>
    </div>
  </main>;
}
