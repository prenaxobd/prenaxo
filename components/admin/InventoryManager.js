'use client';

import { useState } from 'react';

export default function InventoryManager({ initialProducts, initialMovements }) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState({ productId: initialProducts[0]?.id || '', quantityChange: '', reason: '', type: 'ADJUSTMENT' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function adjust(event) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch('/api/admin/inventory', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || 'Unable to adjust stock.'); setSaving(false); return; }
    setProducts(items => items.map(product => product.id === form.productId ? { ...product, stock: data.newStock } : product));
    setForm(current => ({ ...current, quantityChange: '', reason: '' }));
    setMessage('Stock adjusted and recorded.');
    setSaving(false);
  }

  return <>
    <form className="admin-form inventory-adjust-form" onSubmit={adjust}><div className="admin-form-head"><div><h2>Adjust stock</h2><p className="muted">Every adjustment is recorded for audit.</p></div></div><div className="admin-form-grid"><label>Product<select required value={form.productId} onChange={event => setForm({ ...form, productId: event.target.value })}>{products.map(product => <option key={product.id} value={product.id}>{product.name} ({product.stock} in stock)</option>)}</select></label><label>Quantity change<input required type="number" value={form.quantityChange} onChange={event => setForm({ ...form, quantityChange: event.target.value })} placeholder="Use a negative number to remove stock" /></label><label>Reason<input required value={form.reason} onChange={event => setForm({ ...form, reason: event.target.value })} placeholder="Damaged, received, recount..." /></label><label>Type<select value={form.type} onChange={event => setForm({ ...form, type: event.target.value })}><option value="ADJUSTMENT">Adjustment</option><option value="RECEIVED">Received</option><option value="DAMAGED">Damaged</option><option value="RETURN">Return</option></select></label></div><button className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save adjustment'}</button>{message && <p className="admin-message">{message}</p>}</form>
    <section className="section" style={{ paddingBottom: 0 }}><div className="section-head"><div><h2>Stock overview</h2><p className="muted">Current stock from the Product table</p></div></div><div className="admin-table-wrap"><table className="table"><thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Threshold</th><th>Status</th></tr></thead><tbody>{products.map(product => <tr key={product.id}><td><strong>{product.name}</strong></td><td>{product.sku}</td><td className={product.stock <= product.lowStock ? 'low-stock' : ''}>{product.stock}</td><td>{product.lowStock}</td><td><span className={product.stock === 0 ? 'status' : product.stock <= product.lowStock ? 'status status-pending' : 'status active'}>{product.stock === 0 ? 'Out of stock' : product.stock <= product.lowStock ? 'Low stock' : 'Healthy'}</span></td></tr>)}</tbody></table></div></section>
    <section className="section" style={{ paddingBottom: 0 }}><div className="section-head"><div><h2>Recent movements</h2></div></div>{initialMovements.length ? <div className="admin-table-wrap"><table className="table"><thead><tr><th>Product</th><th>Change</th><th>New stock</th><th>Reason</th><th>Date</th></tr></thead><tbody>{initialMovements.map(movement => <tr key={movement.id}><td>{movement.product.name}</td><td className={movement.quantityChange < 0 ? 'low-stock' : 'positive'}>{movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}</td><td>{movement.newStock}</td><td>{movement.reason || movement.type}</td><td>{new Date(movement.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <p className="muted">No stock movements yet.</p>}</section>
  </>;
}
