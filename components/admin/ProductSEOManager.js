'use client';

import { useState } from 'react';

const blank = productId => ({ productId, metaTitle: '', metaDescription: '', focusKeyword: '', canonicalUrl: '', robotsIndex: 'INDEX', robotsFollow: 'FOLLOW', ogTitle: '', ogDescription: '', ogImage: '' });

export default function ProductSEOManager({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState(initialProducts[0]?.id || '');
  const [form, setForm] = useState(() => initialProducts[0] ? { ...blank(initialProducts[0].id), ...(initialProducts[0].seo || {}) } : blank(''));
  const [message, setMessage] = useState('');
  const selectedProduct = products.find(product => product.id === selectedId);

  function selectProduct(event) {
    const productId = event.target.value;
    const product = products.find(item => item.id === productId);
    setSelectedId(productId);
    setForm({ ...blank(productId), ...(product?.seo || {}) });
    setMessage('');
  }

  async function save(event) {
    event.preventDefault();
    const response = await fetch('/api/admin/seo/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || 'Unable to save SEO settings.');
    setProducts(items => items.map(product => product.id === selectedId ? { ...product, seo: data } : product));
    setForm(current => ({ ...current, ...data }));
    setMessage('SEO settings saved.');
  }

  return <>
    <div className="section-head"><div><div className="eyebrow">SEO workspace</div><h1>Product SEO</h1><p className="muted">Set search metadata without changing product content or URLs.</p></div></div>
    {!products.length ? <p className="muted">No active products found.</p> : <form className="admin-form" onSubmit={save}><label>Product<select value={selectedId} onChange={selectProduct}>{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><div className="admin-form-grid"><section><h3>Search result</h3><label>Meta title<input maxLength="191" value={form.metaTitle || ''} onChange={event => setForm({ ...form, metaTitle: event.target.value })} placeholder={selectedProduct?.name} /></label><label>Meta description<textarea maxLength="191" value={form.metaDescription || ''} onChange={event => setForm({ ...form, metaDescription: event.target.value })} /></label><label>Focus keyword<input value={form.focusKeyword || ''} onChange={event => setForm({ ...form, focusKeyword: event.target.value })} /></label><label>Canonical URL<input value={form.canonicalUrl || ''} onChange={event => setForm({ ...form, canonicalUrl: event.target.value })} placeholder={`/product/${selectedProduct?.slug || ''}`} /></label></section><section><h3>Social preview</h3><label>Open Graph title<input value={form.ogTitle || ''} onChange={event => setForm({ ...form, ogTitle: event.target.value })} /></label><label>Open Graph description<textarea value={form.ogDescription || ''} onChange={event => setForm({ ...form, ogDescription: event.target.value })} /></label><label>Open Graph image URL<input value={form.ogImage || ''} onChange={event => setForm({ ...form, ogImage: event.target.value })} /></label><label>Robots<select value={form.robotsIndex} onChange={event => setForm({ ...form, robotsIndex: event.target.value })}><option value="INDEX">Index</option><option value="NOINDEX">No index</option></select></label><label>Follow links<select value={form.robotsFollow} onChange={event => setForm({ ...form, robotsFollow: event.target.value })}><option value="FOLLOW">Follow</option><option value="NOFOLLOW">No follow</option></select></label></section></div><button className="btn">Save SEO settings</button>{message && <p className="admin-message">{message}</p>}</form>}
  </>;
}
