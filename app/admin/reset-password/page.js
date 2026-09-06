'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ResetPassword() {
  const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(event) { event.preventDefault(); setLoading(true); setError(''); const token = new URLSearchParams(window.location.search).get('token'); const response = await fetch('/api/admin/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) }); const result = await response.json(); if (!response.ok) setError(result.error || 'Unable to reset password.'); else setMessage('Password changed. You can now sign in.'); setLoading(false); }
  return <main className="admin-login-page"><form className="admin-login-card" onSubmit={submit}><Link className="admin-login-logo" href="/"><img src="/uploads/PonnoMelaLogo.webp" alt="Ponnomela" /></Link><p className="admin-login-eyebrow">Ponnomela Admin</p><h1>Set a new password</h1><label>New Password<input type="password" minLength="8" value={password} onChange={event => setPassword(event.target.value)} required /></label>{error && <p className="admin-login-error" role="alert">{error}</p>}{message && <p className="admin-login-success" role="status">{message}</p>}<button className="admin-login-submit" disabled={loading}>{loading ? 'Saving...' : 'Change Password'}</button>{message && <Link className="admin-login-back" href="/admin/login">Back to sign in</Link>}</form></main>;
}