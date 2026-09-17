'use client';

import { useState } from 'react';

const empty = { code: '', type: 'PERCENTAGE', value: '', minimumOrder: '', expiresAt: '', active: true };

export default function CouponManager({ initialCoupons }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [form, setForm] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [error, setError] = useState('');
  const visible = coupons.filter(coupon => `${coupon.code} ${coupon.type}`.toLowerCase().includes(query.toLowerCase()) && (status === 'ALL' || (status === 'ACTIVE' ? coupon.active : !coupon.active)));

  async function save(event) {
    event.preventDefault();
    const response = await fetch('/api/admin/coupons', { method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'Unable to save coupon.');
    const item = { ...data, value: Number(data.value), minimumOrder: data.minimumOrder == null ? null : Number(data.minimumOrder), expiresAt: data.expiresAt || null };
    setCoupons(items => form.id ? items.map(current => current.id === form.id ? item : current) : [item, ...items]);
    setForm(null);
    setError('');
  }

  async function deactivate(id) {
    if (!confirm('Deactivate this coupon?')) return;
    const response = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
    if (response.ok) setCoupons(items => items.map(item => item.id === id ? { ...item, active: false } : item));
  }

  return <><div className="section-head"><div><div className="eyebrow">Promotions</div><h1>Coupons</h1></div><button className="btn" onClick={() => { setForm({ ...empty }); setError(''); }}>+ Add coupon</button></div>
    {form && <form className="admin-form" onSubmit={save}><div className="admin-form-head"><h2>{form.id ? 'Edit coupon' : 'New coupon'}</h2><button type="button" onClick={() => setForm(null)}>Cancel</button></div><div className="admin-form-grid"><section><label>Code<input required value={form.code} onChange={event => setForm({ ...form, code: event.target.value })} /></label><label>Type<select value={form.type} onChange={event => setForm({ ...form, type: event.target.value })}><option>PERCENTAGE</option><option>FIXED</option></select></label><label>Value<input required min="0" type="number" value={form.value} onChange={event => setForm({ ...form, value: event.target.value })} /></label></section><section><label>Minimum order<input min="0" type="number" value={form.minimumOrder || ''} onChange={event => setForm({ ...form, minimumOrder: event.target.value || null })} /></label><label>Expiry date<input type="date" value={form.expiresAt ? form.expiresAt.slice(0, 10) : ''} onChange={event => setForm({ ...form, expiresAt: event.target.value || null })} /></label><label className="check-label"><input type="checkbox" checked={form.active} onChange={event => setForm({ ...form, active: event.target.checked })} /> Active</label></section></div>{error && <p className="admin-message">{error}</p>}<button className="btn">Save coupon</button></form>}
    <div className="admin-toolbar coupon-toolbar"><input placeholder="Search coupon code" value={query} onChange={event => setQuery(event.target.value)} /><select value={status} onChange={event => setStatus(event.target.value)}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select><span>{visible.length} coupons</span></div><div className="admin-table-wrap coupon-table-wrap"><table className="table coupon-table"><thead><tr><th>Coupon</th><th>Discount type</th><th>Value</th><th>Minimum order</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visible.map(coupon => <tr key={coupon.id}><td><div className="admin-coupon-identity"><span className="admin-coupon-code">{coupon.code}</span><small>{coupon.active ? 'Ready to use' : 'Not available'}</small></div></td><td><span className="admin-coupon-type">{coupon.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed amount'}</span></td><td><strong className="admin-coupon-value">{coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `৳${Number(coupon.value).toLocaleString()}`}</strong></td><td><span className="admin-coupon-minimum">৳{Number(coupon.minimumOrder || 0).toLocaleString()}</span></td><td><span className={coupon.expiresAt ? 'admin-coupon-expiry' : 'admin-coupon-expiry no-expiry'}>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No expiry'}</span></td><td><span className={coupon.active ? 'status active' : 'status'}>{coupon.active ? 'Active' : 'Inactive'}</span></td><td><div className="admin-coupon-actions"><button className="admin-coupon-edit" onClick={() => setForm({ ...coupon })}>Edit</button>{coupon.active && <button className="admin-coupon-deactivate" onClick={() => deactivate(coupon.id)}>Deactivate</button>}</div></td></tr>)}</tbody></table>{!visible.length && <p className="muted admin-empty">No coupons found.</p>}</div>
  </>;
}
