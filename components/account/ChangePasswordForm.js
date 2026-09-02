'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ChangePasswordForm() {

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();

    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setMessage('Password changed successfully.');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="account-main account-single-page">

      <div className="account-page-header">

        <div>
          <span className="account-eyebrow">SECURITY</span>
          <h1>Change Password</h1>
          <p>Keep your account secure with a strong password.</p>
        </div>

        <Link
          href="/account"
          className="account-back-btn"
        >
          ← Back to Account
        </Link>

      </div>

      <form
        onSubmit={submit}
        className="account-card password-card"
      >

        <div className="password-icon">
          🔒
        </div>

        <div className="form-field">
          <label>Current Password</label>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>New Password</label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="form-field">
          <label>Confirm New Password</label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="account-error">
            {error}
          </div>
        )}

        {message && (
          <div className="account-success">
            {message}
          </div>
        )}

        <button
          type="submit"
          className="account-primary-btn"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Change Password'}
        </button>

      </form>

    </section>
  );
}