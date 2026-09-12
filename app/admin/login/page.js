'use client';

import Link from 'next/link';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/auth/me').then(response => { if (response.ok) window.location.replace('/admin'); }).catch(() => {});
  }, []);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, rememberMe }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.assign(next?.startsWith('/admin') ? next : '/admin');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return <main className="admin-login-page"><form className="admin-login-card" onSubmit={submit}>
    <Link className="admin-login-logo" href="/"><img src="/uploads/prenaxo-logo.png" alt="Prenaxo" /></Link>
    <div className="admin-login-icon"><LockKeyhole size={20} /></div>
    <p className="admin-login-eyebrow">Prenaxo Admin</p>
    <h1>Sign in to your account</h1>
    <label>Email Address<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
    <label>Password<span className="admin-password-field"><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
    <div className="admin-login-options"><label className="admin-remember"><input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} /> Remember Me</label><Link href="/admin/forgot-password">Forgot Password?</Link></div>
    {error && <p className="admin-login-error" role="alert">{error}</p>}
    <button className="admin-login-submit" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
  </form></main>;
}