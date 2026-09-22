'use client';
import OptimizedImage from '@/components/OptimizedImage';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Tag, Truck, UserRound } from 'lucide-react';
import { useState } from 'react';
import './AuthPage.css';

const features = [
  [Tag, 'Exclusive Deals', 'Special offers just for you'],
  [Truck, 'Fast Delivery', 'Across Bangladesh'],
  [ShieldCheck, 'Trusted & Secure', 'Your data is safe with us'],
];

function safeRedirect() {
  const next = new URLSearchParams(window.location.search).get('next');
  return next === '/admin' || next?.startsWith('/admin/') ? next : '/account';
}

export default function AuthPage({ mode = 'login' }) {
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setError('');

    if (!form.email.trim()) {
      setError('Please enter your email or mobile number.');
      return;
    }
    if (!form.password) {
      setError('Please enter your password.');
      return;
    }
    if (!isLogin && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { identifier: form.email.trim(), password: form.password }
        : { name: form.name.trim(), identifier: form.email.trim(), password: form.password };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(isLogin ? 'Invalid email/mobile number or password.' : (result.error || 'Unable to create your account.'));
      window.dispatchEvent(new Event('auth-state-changed'));
      window.location.assign(isLogin ? safeRedirect() : '/login?registered=1');
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  async function continueWithGoogle() {
    if (loading) return;
    await signIn('google', { callbackUrl: safeRedirect() });
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-promo" aria-label="Prenaxo benefits">
          <div className="auth-promo-image" />
          <div className="auth-promo-overlay" />
          <div className="auth-promo-content">
            <Link className="auth-brand" href="/" aria-label="Prenaxo home">
              <OptimizedImage src="/uploads/prenaxo-logo.png" alt="Prenaxo" />
            </Link>
            <div className="auth-promo-copy">
              <span className="auth-kicker">QUALITY PRODUCTS, BETTER LIFE</span>
              <h1>{isLogin ? <>Welcome Back to<br /><strong>Prenaxo</strong></> : <>Welcome to<br /><strong>Prenaxo</strong></>}</h1>
              <p>{isLogin ? 'Sign in to your account and continue shopping your favorite products.' : 'Create your account and get access to exclusive deals, faster checkout and a better shopping experience.'}</p>
            </div>
            <div className="auth-features">
              {features.map(([Icon, title, text]) => <div className="auth-feature" key={title}><span><Icon size={18} /></span><div><strong>{title}</strong><small>{text}</small></div></div>)}
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-top-link">{isLogin ? <>Don&apos;t have an account? <Link href="/register">Create Account <ArrowRight size={14} /></Link></> : <>Already have an account? <Link href="/login">Sign In <ArrowRight size={14} /></Link></>}</div>
          <div className="auth-form-wrap">
            <div className="auth-form-heading"><span className="auth-form-icon">{isLogin ? <LockKeyhole size={19} /> : <UserRound size={19} />}</span><span className="auth-kicker">{isLogin ? 'WELCOME BACK' : 'JOIN PRENAXO'}</span><h2>{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2><p>{isLogin ? 'Sign in to your account and continue shopping.' : 'Create an account to start shopping with Prenaxo.'}</p></div>
            <form className="auth-form" onSubmit={submit} noValidate>
              {!isLogin && <label><span>Full Name</span><div className="auth-input-wrap"><UserRound size={17} /><input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Enter your full name" required autoComplete="name" /></div></label>}
              <label><span>Email / Mobile Number</span><div className="auth-input-wrap"><Mail size={17} /><input value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="Enter your email or mobile number" required autoComplete={isLogin ? 'username' : 'email'} /></div></label>
              <label><span>Password</span><div className="auth-input-wrap"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="Enter your password" required minLength={isLogin ? undefined : 8} autoComplete={isLogin ? 'current-password' : 'new-password'} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
              {!isLogin && <label><span>Confirm Password</span><div className="auth-input-wrap"><LockKeyhole size={17} /><input type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder="Confirm your password" required minLength={8} autoComplete="new-password" /><button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>}
              {isLogin && <div className="auth-options"><label className="auth-remember"><input type="checkbox" /> <span>Remember me</span></label><span className="auth-forgot" title="Customer password reset is not configured yet">Forgot Password?</span></div>}
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button className="auth-submit" type="submit" disabled={loading}>{loading ? (isLogin ? 'Signing in...' : 'Creating account...') : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={17} /></>}</button>
            </form>
            <div className="auth-divider"><span>OR</span></div>
            <button className="auth-google" type="button" onClick={continueWithGoogle} disabled={loading}><OptimizedImage className="auth-google-mark" src="/uploads/google.webp" alt="" onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.nextElementSibling.hidden = false; }} /> <span className="auth-google-fallback" hidden>G</span> Continue with Google</button>
            <p className="auth-legal">By signing in, you agree to our <Link href="/terms">Terms &amp; Conditions</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
