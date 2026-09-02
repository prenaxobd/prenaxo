'use client';

import { useState } from 'react';

const types = [
  ['FEATURED', 'Featured products'],
  ['TOP_SELLING', 'Top selling products'],
  ['DEALS', "Today's deals"],
  ['NEW_ARRIVALS', 'New arrivals'],
  ['CATEGORY', 'Category products'],
];

const empty = { type: 'FEATURED', title: '', subtitle: '', eyebrow: '', href: '/shop', categoryId: '', productLimit: 8, active: true, sortOrder: 0 };

export default function HomepageSectionManager({ initialSections, categories }) {
  const [sections, setSections] = useState(initialSections);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');

  function edit(section) {
    setForm(section ? { ...section, categoryId: section.categoryId || '' } : { ...empty, sortOrder: sections.length });
    setMessage('');
  }

  async function save(event) {
    event.preventDefault();
    const response = await fetch('/api/admin/homepage-sections', { method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, categoryId: form.type === 'CATEGORY' ? form.categoryId || null : null }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || 'Unable to save section.');
    setSections(current => form.id ? current.map(item => item.id === data.id ? data : item).sort((a, b) => a.sortOrder - b.sortOrder) : [...current, data].sort((a, b) => a.sortOrder - b.sortOrder));
    setForm(null);
    setMessage('Homepage section saved.');
  }

  async function archive(id) {
    const response = await fetch(`/api/admin/homepage-sections?id=${id}`, { method: 'DELETE' });
    if (response.ok) setSections(current => current.map(item => item.id === id ? { ...item, active: false } : item));
  }

  return <>
    <div className="section-head"><div><div className="eyebrow">Homepage</div><h1>Section builder</h1></div><button className="btn" onClick={() => edit()}>+ Add section</button></div>
    <p className="muted">Control which database-driven product sections appear on the homepage and their display order.</p>
    {message && <p className="admin-message">{message}</p>}
    {form && <form className="admin-form" onSubmit={save}><div className="admin-form-head"><h2>{form.id ? 'Edit section' : 'Add section'}</h2><button type="button" onClick={() => setForm(null)}>Cancel</button></div><div className="admin-form-grid"><section><label>Section type<select value={form.type} onChange={event => setForm({ ...form, type: event.target.value })}>{types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Title<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label><label>Eyebrow<input value={form.eyebrow || ''} onChange={event => setForm({ ...form, eyebrow: event.target.value })} /></label><label>Subtitle<input value={form.subtitle || ''} onChange={event => setForm({ ...form, subtitle: event.target.value })} /></label></section><section>{form.type === 'CATEGORY' && <label>Category<select required value={form.categoryId} onChange={event => setForm({ ...form, categoryId: event.target.value })}><option value="">Select category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>}<label>Product limit<input type="number" min="1" max="24" value={form.productLimit} onChange={event => setForm({ ...form, productLimit: event.target.value })} /></label><label>Display order<input type="number" value={form.sortOrder} onChange={event => setForm({ ...form, sortOrder: event.target.value })} /></label><label>View-all URL<input value={form.href || ''} onChange={event => setForm({ ...form, href: event.target.value })} /></label><label className="check-label"><input type="checkbox" checked={form.active} onChange={event => setForm({ ...form, active: event.target.checked })} /> Visible on homepage</label></section></div><button className="btn">Save section</button></form>}
    <div className="homepage-section-list">{sections.map(section => <article className="homepage-section-row" key={section.id}><span className="homepage-section-order">{section.sortOrder}</span><div><strong>{section.title}</strong><small>{section.type}{section.category ? ` · ${section.category.name}` : ''} · {section.productLimit} products</small></div><span className={`status ${section.active ? 'active' : ''}`}>{section.active ? 'Visible' : 'Hidden'}</span><button onClick={() => edit(section)}>Edit</button><button onClick={() => archive(section.id)}>Hide</button></article>)}</div>
  </>;
}
