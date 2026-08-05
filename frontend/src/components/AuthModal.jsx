import React, { useEffect, useRef, useState } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('yugcoin_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('yugcoin_remembered_email')));
  const [securityPin, setSecurityPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef(null);
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return undefined;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          setError('');
          setLoading(true);
          try {
            const response = await api.googleAuth(credential, securityPin);
            localStorage.setItem('yugcoin_token', response.token);
            onSuccess(response.user, response.initialTransaction);
          } catch (err) {
            setError(err.message || 'Google sign-in failed.');
          } finally {
            setLoading(false);
          }
        }
      });
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline', size: 'large', width: 360,
        text: mode === 'login' ? 'signin_with' : 'signup_with'
      });
    };

    const script = document.querySelector('script[data-google-identity]');
    if (script) {
      script.addEventListener('load', renderGoogleButton);
      renderGoogleButton();
      return () => script.removeEventListener('load', renderGoogleButton);
    }
    const googleScript = document.createElement('script');
    googleScript.src = 'https://accounts.google.com/gsi/client';
    googleScript.async = true;
    googleScript.defer = true;
    googleScript.dataset.googleIdentity = 'true';
    googleScript.addEventListener('load', renderGoogleButton);
    document.head.appendChild(googleScript);
    return () => googleScript.removeEventListener('load', renderGoogleButton);
  }, [googleClientId, mode, securityPin, onSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register') {
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
        setError('Use at least 8 characters with an uppercase letter, lowercase letter, and number.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Password confirmation does not match.');
        return;
      }
    }
    setLoading(true);

    try {
      let res;
      if (mode === 'login') {
        res = await api.login(email, password);
      } else {
        res = await api.register({ name, email, password, confirmPassword, securityPin });
      }

      if (res.success) {
        localStorage.setItem('yugcoin_token', res.token);
        if (mode === 'login' && rememberMe) {
          localStorage.setItem('yugcoin_remembered_email', email);
        } else if (mode === 'login') {
          localStorage.removeItem('yugcoin_remembered_email');
        }
        onSuccess(res.user, res.initialTransaction);
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

          {mode === 'register' && (
            <p className="auth-disclaimer">Use an official email address created in your own name. Your YugCoin username is generated from your account identity and cannot be changed later.</p>
          )}

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

          {mode === 'register' && (
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="liquid-input"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span className="password-requirements">At least 8 characters, with uppercase, lowercase, and a number.</span>
            </div>
          )}

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
                  style={{ paddingLeft: '2.5rem', letterSpacing: '0.2em' }}
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

        <div className="auth-divider"><span>or continue with</span></div>
        {googleClientId ? <div className="google-auth-button" ref={googleButtonRef} /> : <p className="google-config-notice">Google sign-in will be available after <code>REACT_APP_GOOGLE_CLIENT_ID</code> is configured.</p>}

        <div className="flex justify-between items-center" style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <span>
            {mode === 'login' ? "New to Yugcoin?" : "Already have a wallet?"}
          </span>
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setPassword(''); setConfirmPassword(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
          >
            {mode === 'login' ? 'Create Wallet' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
