'use client';

import { useState } from 'react';

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

const empty = { name: '', slug: '', kind: 'TEXT', active: true, sortOrder: 0, values: [] };

export default function AttributeManager({ initialAttributes = [] }) {
  const [attributes, setAttributes] = useState(initialAttributes);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [actionId, setActionId] = useState(null);
  const visible = attributes.filter(attribute => `${attribute.name || ''} ${attribute.slug || ''}`.toLowerCase().includes(query.toLowerCase()));

  async function save(event) {
    event.preventDefault();
    setMessage('');
    const response = await fetch('/api/admin/attributes', { method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || 'Unable to save attribute.');
    setAttributes(items => form.id ? items.map(item => item.id === data.id ? data : item) : [...items, data]);
    setForm(null);
    setMessage('Attribute saved successfully.');
  }

  function addValue() {
    setForm(current => ({ ...current, values: [...current.values, { name: '', slug: '', hexValue: '', active: true, sortOrder: current.values.length }] }));
  }

  function updateValue(index, changes) {
    setForm(current => ({ ...current, values: current.values.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item) }));
  }

  return <>
    <div className="admin-page-heading attribute-page-heading"><div><div className="eyebrow">Catalogue</div><h1>Attributes</h1><p className="muted">Manage reusable product options such as Color and Size.</p></div><button className="btn" type="button" onClick={() => { setMessage(''); setForm({ ...empty }); }}>+ Add attribute</button></div>
    {message && <p className="admin-message">{message}</p>}
    {form && <form className="admin-form attribute-form" onSubmit={save}>
      <div className="admin-form-head"><div><h2>{form.id ? 'Edit attribute' : 'Add attribute'}</h2><p className="attribute-form-hint">Define the option and its selectable values.</p></div><button type="button" onClick={() => setForm(null)}>Cancel</button></div>
      <div className="admin-form-grid attribute-main-fields"><label>Name<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value, slug: form.id ? form.slug : slugify(event.target.value) })} /></label><label>Slug<input required value={form.slug} onChange={event => setForm({ ...form, slug: event.target.value })} /></label><label>Type<select value={form.kind} onChange={event => setForm({ ...form, kind: event.target.value })}><option value="TEXT">Text</option><option value="COLOR">Color</option></select></label><label className="check-label attribute-active-check"><input type="checkbox" checked={form.active} onChange={event => setForm({ ...form, active: event.target.checked })} /> Active</label></div>
      <section className="attribute-values-section"><div className="attribute-values-heading"><div><h3>Values</h3><p>Add the choices customers can select.</p></div><span>{form.values.length} values</span></div>{form.values.length ? <div className="attribute-values-list">{form.values.map((value, index) => <div className="attribute-value-row" key={value.id || index}><label>Name<input required value={value.name} onChange={event => updateValue(index, { name: event.target.value, slug: value.id ? value.slug : slugify(event.target.value) })} /></label><label>Slug<input required value={value.slug} onChange={event => updateValue(index, { slug: event.target.value })} /></label>{form.kind === 'COLOR' && <label>HEX<input value={value.hexValue || ''} placeholder="#ffffff" onChange={event => updateValue(index, { hexValue: event.target.value })} /></label>}</div>)}</div> : <p className="attribute-values-empty">No values added yet.</p>}<button className="admin-secondary-btn attribute-add-value" type="button" onClick={addValue}>+ Add value</button></section>
      <div className="admin-form-actions"><button className="btn">Save attribute</button></div>
    </form>}
    <div className="admin-toolbar attribute-toolbar"><input placeholder="Search attributes" value={query} onChange={event => setQuery(event.target.value)} /><span>{visible.length} attributes</span></div>
    <div className="admin-table-wrap attribute-table-wrap"><table className="table attribute-table"><thead><tr><th>Attribute</th><th>Type</th><th>Values</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visible.map(attribute => <tr key={attribute.id}><td><strong title={attribute.name}>{attribute.name}</strong><small className="stock-label">{attribute.slug}</small></td><td><span className="attribute-type-pill">{attribute.kind}</span></td><td><span className="stock">{attribute.values?.length || 0}</span></td><td><span className={attribute.active ? 'status active' : 'status'}>{attribute.active ? 'Active' : 'Inactive'}</span></td><td><div className="admin-action-menu"><button type="button" aria-label={`Actions for ${attribute.name}`} onClick={() => setActionId(actionId === attribute.id ? null : attribute.id)}>⋮</button>{actionId === attribute.id && <div className="admin-action-popover"><button type="button" onClick={() => { setActionId(null); setForm({ ...attribute, values: attribute.values || [] }); }}>Edit</button></div>}</div></td></tr>)}</tbody></table>{!visible.length && <p className="muted attribute-empty">No attributes found.</p>}</div>
  </>;
}