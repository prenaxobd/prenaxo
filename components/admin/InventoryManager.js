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
    <section className="section inventory-panel"><div className="section-head"><div><div className="section-kicker">INVENTORY HEALTH</div><h2>Stock overview</h2><p className="muted">Current stock from the Product table</p></div></div><div className="admin-table-wrap inventory-table-wrap"><table className="table inventory-table stock-overview-table"><thead><tr><th>Product</th><th>SKU</th><th>Available stock</th><th>Threshold</th><th>Status</th></tr></thead><tbody>{products.map(product => { const stockPercent = product.lowStock > 0 ? Math.min(100, Math.round((product.stock / (product.lowStock * 4)) * 100)) : 100; return <tr key={product.id}><td><div className="inventory-product-cell"><div className="inventory-product-thumb">{product.images?.[0]?.url ? <img src={product.images[0].url} alt="" /> : <span>—</span>}</div><strong className="inventory-product-name">{product.name}</strong></div></td><td><span className="inventory-sku">{product.sku}</span></td><td><div className="inventory-stock-cell"><strong className={product.stock <= product.lowStock ? 'low-stock' : ''}>{product.stock}</strong><span className="inventory-stock-track"><span style={{ width: `${stockPercent}%` }} /></span></div></td><td className="inventory-number">{product.lowStock}</td><td><span className={product.stock === 0 ? 'status' : product.stock <= product.lowStock ? 'status status-pending' : 'status active'}>{product.stock === 0 ? 'Out of stock' : product.stock <= product.lowStock ? 'Low stock' : 'Healthy'}</span></td></tr>; })}</tbody></table></div></section>
    <section className="section inventory-panel"><div className="section-head"><div><div className="section-kicker">AUDIT TRAIL</div><h2>Recent movements</h2><p className="muted">Latest stock changes across products</p></div></div>{initialMovements.length ? <div className="admin-table-wrap inventory-table-wrap"><table className="table inventory-table movement-table"><thead><tr><th>Product</th><th>Change</th><th>New stock</th><th>Reason</th><th>Date</th></tr></thead><tbody>{initialMovements.map(movement => <tr key={movement.id}><td><strong className="inventory-product-name">{movement.product.name}</strong></td><td className={movement.quantityChange < 0 ? 'low-stock inventory-number' : 'positive inventory-number'}>{movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}</td><td className="inventory-number">{movement.newStock}</td><td><span className="movement-reason">{movement.reason || movement.type}</span></td><td><span className="inventory-date">{new Date(movement.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></td></tr>)}</tbody></table></div> : <p className="muted inventory-empty">No stock movements yet.</p>}</section>
  </>;
}
