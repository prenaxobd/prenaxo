'use client';

import { useMemo, useState } from 'react';
import MediaUploader from '@/components/admin/MediaUploader';

const empty = { name: '', slug: '', description: '', image: '', parentId: null, active: true, attributeIds: [] };

function getDescendantIds(categories, categoryId) {
  const descendants = new Set();
  const pending = [categoryId];
  while (pending.length) {
    const parentId = pending.pop();
    categories.forEach(category => {
      if (category.parentId === parentId && !descendants.has(category.id)) {
        descendants.add(category.id);
        pending.push(category.id);
      }
    });
  }
  return descendants;
}

function getCategoryRows(categories) {
  const childrenByParent = new Map();
  categories.forEach(category => {
    const parentId = category.parentId || null;
    const children = childrenByParent.get(parentId) || [];
    children.push(category);
    childrenByParent.set(parentId, children);
  });
  childrenByParent.forEach(children => children.sort((first, second) => first.name.localeCompare(second.name)));

  const rows = [];
  const visit = (parentId, depth) => {
    (childrenByParent.get(parentId) || []).forEach(category => {
      rows.push({ ...category, depth });
      visit(category.id, depth + 1);
    });
  };
  visit(null, 0);
  return rows;
}

export default function CategoryManager({ initialCategories, attributes = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [actionId, setActionId] = useState(null);
  const categoryRows = useMemo(() => getCategoryRows(categories), [categories]);

  function updateForm(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  async function save(event) {
    event.preventDefault();
    setMessage('');
    const response = await fetch('/api/admin/categories', {
      method: form.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'Unable to save category.');
      return;
    }
    setCategories(items => form.id ? items.map(item => item.id === data.id ? data : item) : [...items, data]);
    setForm(null);
  }

  async function archive(id) {
    if (!confirm('Archive this empty category?')) return;
    const response = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
    if (response.ok) {
      setCategories(items => items.map(item => item.id === id ? { ...item, active: false } : item));
    } else {
      setMessage((await response.json()).error);
    }
  }

  function openEdit(category) {
    setActionId(null);
    setForm({ ...category, parentId: category.parentId || null, attributeIds: category.attributes?.map(item => item.attributeId) || [] });
  }

  const parentOptions = form ? categories.filter(category => {
    if (category.id === form.id) return false;
    if (!form.id) return true;
    return !getDescendantIds(categories, form.id).has(category.id);
  }) : [];

  return <>
    <div className="admin-page-heading category-page-heading">
      <div><div className="eyebrow">Catalogue</div><h1>Categories</h1><p className="muted">Manage your catalogue and build nested collections.</p></div>
      <button className="btn" onClick={() => { setMessage(''); setForm({ ...empty }); }}>+ Add category</button>
    </div>
    {message && <p className="admin-message">{message}</p>}
    {form && <form className="admin-form category-form" onSubmit={save}>
      <div className="admin-form-head"><div><h2>{form.id ? 'Edit category' : 'Add category'}</h2><p className="category-form-hint">Choose a parent to create a subcategory.</p></div><button type="button" onClick={() => setForm(null)}>Cancel</button></div>
      <div className="admin-form-grid"><section>
        <label>Category name<input required value={form.name} onChange={event => updateForm('name', event.target.value)} /></label>
        <label>Slug<input required value={form.slug} onChange={event => updateForm('slug', event.target.value)} /></label>
        <label>Parent category<select value={form.parentId || ''} onChange={event => updateForm('parentId', event.target.value || null)}><option value="">Root category</option>{parentOptions.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label>Description<textarea value={form.description || ''} onChange={event => updateForm('description', event.target.value)} /></label>
        <label className="check-label"><input type="checkbox" checked={form.active} onChange={event => updateForm('active', event.target.checked)} /> Active</label>
        <fieldset><legend>Enabled attributes</legend>{attributes.map(attribute => <label className="check-label" key={attribute.id}><input type="checkbox" checked={(form.attributeIds || []).includes(attribute.id)} onChange={event => updateForm('attributeIds', event.target.checked ? [...new Set([...(form.attributeIds || []), attribute.id])] : (form.attributeIds || []).filter(id => id !== attribute.id))} />{attribute.name}</label>)}</fieldset>
      </section><MediaUploader label="Category image" multiple={false} images={form.image ? [{ url: form.image, isPrimary: true }] : []} onChange={images => updateForm('image', images[0]?.url || '')} /></div>
      <div className="admin-form-actions"><button className="btn">Save category</button></div>
    </form>}
    <div className="admin-table-wrap category-table-wrap"><table className="table category-table"><thead><tr><th>Image</th><th>Category</th><th>Parent</th><th>Slug</th><th>Products</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{categoryRows.map(category => <tr key={category.id}>
      <td>{category.image ? <img className="admin-thumbnail" src={category.image} alt={category.name} onError={event => { event.currentTarget.style.display = 'none'; }} /> : <div className="no-image">No image</div>}</td>
      <td><div className="category-name-cell" style={{ '--category-depth': category.depth }}><span className="category-tree-mark" aria-hidden="true">{category.depth ? '↳' : '•'}</span><strong title={category.name}>{category.name}</strong></div></td>
      <td>{category.parent?.name || <span className="category-root-label">Root</span>}</td><td>{category.slug}</td><td><span className="stock">{category._count.products}</span></td><td><span className={category.active ? 'status active' : 'status'}>{category.active ? 'Active' : 'Archived'}</span></td><td><span className="admin-date">{category.createdAt ? new Date(category.createdAt).toLocaleDateString('en-GB') : '—'}</span></td>
      <td><div className="admin-action-menu"><button type="button" aria-label={`Actions for ${category.name}`} onClick={() => setActionId(actionId === category.id ? null : category.id)}>⋮</button>{actionId === category.id && <div className="admin-action-popover"><button type="button" onClick={() => openEdit(category)}>Edit</button><button type="button" onClick={() => { setActionId(null); archive(category.id); }}>Archive</button></div>}</div></td>
    </tr>)}</tbody></table></div>
  </>;
}