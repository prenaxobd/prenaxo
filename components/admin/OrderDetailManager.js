'use client';

import { useState } from 'react';
import Link from 'next/link';

const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderDetailManager({ initialOrder }) {
  const [order, setOrder] = useState(initialOrder);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const timeline = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentIndex = timeline.indexOf(order.status);

  async function update(data) {
    setSaving(true);
    const response = await fetch(`/api/admin/orders/${order.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) setMessage(result.error || 'Unable to update order.');
    else { setOrder(current => ({ ...current, ...result })); setMessage('Order updated.'); }
    setSaving(false);
  }

  return <>
    <div className="section-head"><div><div className="eyebrow">Fulfilment</div><h1>{order.orderNumber}</h1><p className="muted">Placed {new Date(order.createdAt).toLocaleDateString()}</p></div><Link className="btn" href="/admin/orders">Back to orders</Link></div>
    {message && <p className="admin-message">{message}</p>}
    <div className="order-admin-grid"><section className="section"><div className="section-head"><div><h2>Order status</h2><p className="muted">Update fulfilment and payment securely.</p></div></div><div className="admin-form-grid"><label>Order status<select value={order.status} disabled={saving} onChange={event => update({ status: event.target.value })}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label><label>Payment status<select value={order.paymentStatus} disabled={saving} onChange={event => update({ paymentStatus: event.target.value })}><option>PENDING</option><option>PAID</option><option>FAILED</option><option>REFUNDED</option></select></label></div><div className="order-timeline">{timeline.map((status, index) => <div className={index <= currentIndex && order.status !== 'CANCELLED' ? 'timeline-step done' : 'timeline-step'} key={status}><span>{index <= currentIndex && order.status !== 'CANCELLED' ? '✓' : index + 1}</span><strong>{status}</strong></div>)}</div></section><section className="section"><h2>Customer</h2><p><strong>{order.customerName}</strong></p><p className="muted">{order.customerEmail}</p><p className="muted">{order.customerPhone}</p><h3>Shipping address</h3><pre className="admin-address">{JSON.stringify(order.shippingAddress, null, 2)}</pre></section></div>
    <section className="section"><div className="section-head"><div><h2>Items</h2><p className="muted">{order.items.length} line items</p></div></div><div className="admin-table-wrap"><table className="table"><thead><tr><th>Product</th><th>Quantity</th><th>Unit price</th><th>Total</th></tr></thead><tbody>{order.items.map(item => <tr key={item.id}><td><strong>{item.productName}</strong></td><td>{item.quantity}</td><td>৳{Number(item.unitPrice).toLocaleString()}</td><td>৳{(Number(item.unitPrice) * item.quantity).toLocaleString()}</td></tr>)}</tbody></table></div><div className="order-admin-total"><span>Subtotal</span><b>৳{Number(order.subtotal).toLocaleString()}</b><span>Discount</span><b>-৳{Number(order.discount).toLocaleString()}</b><span>Shipping</span><b>৳{Number(order.shippingCharge).toLocaleString()}</b><strong>Total</strong><strong>৳{Number(order.total).toLocaleString()}</strong></div></section>
    <section className="section"><h2>Payment</h2><p><strong>{order.paymentMethod}</strong> <span className="status">{order.paymentStatus}</span></p></section>
  </>;
}
