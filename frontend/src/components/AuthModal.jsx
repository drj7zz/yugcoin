import React, { useState } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('yugcoin_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('yugcoin_remembered_email')));
  const [securityPin, setSecurityPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (mode === 'login') {
        res = await api.login(email, password);
      } else {
        res = await api.register({ name, email, password, securityPin });
      }

      if (res.success) {
        localStorage.setItem('yugcoin_token', res.token);
        if (mode === 'login' && rememberMe) {
          localStorage.setItem('yugcoin_remembered_email', email);
        } else if (mode === 'login') {
          localStorage.removeItem('yugcoin_remembered_email');
        }
        onSuccess(res.user);
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <h3 className="font-extrabold" style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>
            {mode === 'login' ? 'Access Wallet' : 'Create Wallet'}
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '50%', color: 'var(--text-muted)', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="animate-slide-in" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="liquid-input"
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                  className="liquid-input"
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="username"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="liquid-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-visibility-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <label className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#94a3b8' }}
              />
              Remember me
            </label>
          )}

          {mode === 'register' && (
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Security PIN (4-digit passcode)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  maxLength={4}
                  className="liquid-input"
                  style={{ paddingLeft: '2.5rem', fontFamily: 'monospace', letterSpacing: '0.2em' }}
                  placeholder="1234"
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="liquid-btn-primary" disabled={loading} style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '1.05rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Dashboard' : 'Initialize Wallet'}
          </button>
        </form>

        <div className="flex justify-between items-center" style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <span>
            {mode === 'login' ? "New to Yugcoin?" : "Already have a wallet?"}
          </span>
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
          >
            {mode === 'login' ? 'Create Wallet' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
