'use client';

import { useState } from 'react';
import { ADMIN_ROLE_TEMPLATES } from '@/lib/permissions';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'ADMIN',
  roleKey: 'ADMINISTRATOR',
};

export default function NewUser() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to create user.');

      setMessage('Worker account created successfully.');
      setForm(initialForm);
    } catch (error) {
      setMessage(error.message || 'Unable to create user.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <div className="eyebrow">People</div>
          <h1>Create worker</h1>
          <p className="muted">Create a secure admin account without exposing any password to the store team.</p>
        </div>
      </div>

      <form className="admin-form" onSubmit={submit}>
        {message ? <p className="admin-message">{message}</p> : null}

        <div className="admin-form-grid">
          <div>
            <label>
              Full name
              <input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="e.g. Md. Rakib Hasan" required />
            </label>

            <label>
              Email address
              <input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="admin@example.com" required />
            </label>

            <label>
              Phone (optional)
              <input value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} placeholder="+8801xxxxxxxxx" />
            </label>
          </div>

          <div>
            <label>
              Password
              <input type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="Create a secure password" minLength={8} required />
            </label>

            <label>
              Role
              <select value={form.roleKey} onChange={event => setForm({ ...form, role: event.target.value === 'USER' ? 'USER' : 'ADMIN', roleKey: event.target.value })}>
                {Object.entries(ADMIN_ROLE_TEMPLATES).map(([key, role]) => <option key={key} value={key}>{role.label}</option>)}
                <option value="USER">Customer / general user</option>
              </select>
            </label>
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create worker'}
          </button>
        </div>
      </form>
    </>
  );
}
