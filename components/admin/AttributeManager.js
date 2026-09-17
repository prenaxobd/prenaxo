'use client';

import { useState } from 'react';

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export default function AttributeManager({ initialAttributes = [] }) {
  const [attributes, setAttributes] = useState(initialAttributes);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');

  async function save(event) {
    event.preventDefault();
    setMessage('');
    const response = await fetch('/api/admin/attributes', {
      method: form.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || 'Unable to save attribute.');
    setAttributes((items) => form.id ? items.map((item) => item.id === data.id ? data : item) : [...items, data]);
    setForm(null);
  }

  function addValue() {
    setForm((current) => ({ ...current, values: [...current.values, { name: '', slug: '', hexValue: '', active: true, sortOrder: current.values.length }] }));
  }

  return <>
    <div className="admin-page-heading"><div><div className="eyebrow">Catalogue</div><h1>Attributes</h1><p className="muted">Manage reusable product options such as Color and Size.</p></div><button className="btn" type="button" onClick={() => setForm({ name: '', slug: '', kind: 'TEXT', active: true, sortOrder: 0, values: [] })}>+ Add attribute</button></div>
    {message && <p className="admin-message">{message}</p>}
    {form && <form className="admin-form" onSubmit={save}><div className="admin-form-head"><h2>{form.id ? 'Edit attribute' : 'Add attribute'}</h2><button type="button" onClick={() => setForm(null)}>Cancel</button></div><label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: form.id ? form.slug : slugify(event.target.value) })} /></label><label>Slug<input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label><label>Type<select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}><option value="TEXT">Text</option><option value="COLOR">Color</option></select></label><label className="check-label"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Active</label><div><h3>Values</h3>{form.values.map((value, index) => <div className="admin-form-grid" key={value.id || index}><label>Name<input required value={value.name} onChange={(event) => setForm({ ...form, values: form.values.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value, slug: value.id ? item.slug : slugify(event.target.value) } : item) })} /></label><label>Slug<input required value={value.slug} onChange={(event) => setForm({ ...form, values: form.values.map((item, itemIndex) => itemIndex === index ? { ...item, slug: event.target.value } : item) })} /></label>{form.kind === 'COLOR' && <label>HEX<input value={value.hexValue || ''} placeholder="#ffffff" onChange={(event) => setForm({ ...form, values: form.values.map((item, itemIndex) => itemIndex === index ? { ...item, hexValue: event.target.value } : item) })} /></label>}</div>)}<button className="btn" type="button" onClick={addValue}>+ Add value</button></div><div className="admin-form-actions"><button className="btn">Save attribute</button></div></form>}
    <div className="admin-table-wrap"><table className="table"><thead><tr><th>Attribute</th><th>Type</th><th>Values</th><th>Status</th><th>Actions</th></tr></thead><tbody>{attributes.map((attribute) => <tr key={attribute.id}><td><strong>{attribute.name}</strong><small className="stock-label">{attribute.slug}</small></td><td>{attribute.kind}</td><td>{attribute.values?.length || 0}</td><td><span className={attribute.active ? 'status active' : 'status'}>{attribute.active ? 'Active' : 'Inactive'}</span></td><td><button className="btn" type="button" onClick={() => setForm({ ...attribute, values: attribute.values || [] })}>Edit</button></td></tr>)}</tbody></table></div>
  </>;
}
