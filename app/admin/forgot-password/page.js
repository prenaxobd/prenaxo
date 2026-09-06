'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault(); setLoading(true); setMessage('');
    const response = await fetch('/api/admin/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const result = await response.json(); setMessage(result.message || 'If an account matches that email, password reset instructions will be sent.'); setLoading(false);
  }
  return <main className="admin-login-page"><form className="admin-login-card" onSubmit={submit}><Link className="admin-login-logo" href="/admin/login"><img src="/uploads/PonnoMelaLogo.webp" alt="Ponnomela" /></Link><p className="admin-login-eyebrow">Ponnomela Admin</p><h1>Forgot Password</h1><p className="admin-login-copy">Enter your admin email to receive reset instructions.</p><label>Email Address<input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>{message && <p className="admin-login-success" role="status">{message}</p>}<button className="admin-login-submit" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button><Link className="admin-login-back" href="/admin/login">Back to sign in</Link></form></main>;
}