'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Package } from 'lucide-react';

const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderDetailManager({ initialOrder }) {
  const [order, setOrder] = useState(initialOrder);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const timeline = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentIndex = timeline.indexOf(order.status);

  function formatAddress(address) {
    if (!address) return 'Not provided';
    if (typeof address === 'string') return address;
    return Object.entries(address)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  function getOptionLabels(item) {
    const relationLabels = (item.product?.attributeValues || [])
      .filter((attributeValue) =>
        (item.attributeValueIds || []).includes(attributeValue.attributeValueId)
      )
      .map((attributeValue) => `${attributeValue.attributeValue?.attribute?.name || 'Option'}: ${attributeValue.attributeValue?.name}`)
      .filter(Boolean);
    const legacyLabels = [
      item.variant?.color ? `Color: ${item.variant.color}` : null,
      item.variant?.size ? `Size: ${item.variant.size}` : null,
      item.variantLabel && !item.variant?.color && !item.variant?.size ? item.variantLabel : null,
    ].filter(Boolean);
    return relationLabels.length ? relationLabels : legacyLabels;
  }

  async function copyOrderDetails() {
    const itemLines = order.items.map((item, index) => {
      const options = getOptionLabels(item);
      return `${index + 1}. ${item.productName}${options.length ? ` (${options.join(', ')})` : ''} | Qty: ${item.quantity} | Unit: ৳${Number(item.unitPrice).toLocaleString()} | Total: ৳${(Number(item.unitPrice) * item.quantity).toLocaleString()}`;
    });
    const text = [
      `Order: ${order.orderNumber}`,
      `Customer: ${order.customerName}`,
      `Phone: ${order.customerPhone || 'Not provided'}`,
      `Email: ${order.customerEmail || 'Not provided'}`,
      `Address: ${formatAddress(order.shippingAddress)}`,
      '',
      'Products:',
      ...itemLines,
      '',
      `Subtotal: ৳${Number(order.subtotal).toLocaleString()}`,
      `Discount: -৳${Number(order.discount).toLocaleString()}`,
      `Shipping: ৳${Number(order.shippingCharge).toLocaleString()}`,
      `Total: ৳${Number(order.total).toLocaleString()}`,
    ].join('\n');
    await navigator.clipboard.writeText(text);
    setMessage('Order details copied.');
  }

  async function update(data) {
    setSaving(true);
    const response = await fetch(`/api/admin/orders/${order.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) setMessage(result.error || 'Unable to update order.');
    else { setOrder(current => ({ ...current, ...result })); setMessage('Order updated.'); }
    setSaving(false);
  }

  return <>
    <div className="section-head order-detail-heading"><div><div className="eyebrow">Fulfilment</div><h1>{order.orderNumber}</h1><p className="muted">Placed {new Date(order.createdAt).toLocaleDateString()}</p></div><div className="order-detail-actions"><button className="btn order-copy-btn" type="button" onClick={copyOrderDetails}><Copy size={15} /> Copy order details</button><Link className="btn" href="/admin/orders">Back to orders</Link></div></div>
    {message && <p className="admin-message"><Check size={15} /> {message}</p>}
    <div className="order-admin-grid"><section className="section order-status-card"><div className="section-head"><div><h2>Order status</h2><p className="muted">Update fulfilment and payment securely.</p></div></div><div className="admin-form-grid"><label>Order status<select value={order.status} disabled={saving} onChange={event => update({ status: event.target.value })}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label><label>Payment status<select value={order.paymentStatus} disabled={saving} onChange={event => update({ paymentStatus: event.target.value })}><option>PENDING</option><option>PAID</option><option>FAILED</option><option>REFUNDED</option></select></label></div><div className="order-timeline">{timeline.map((status, index) => <div className={index <= currentIndex && order.status !== 'CANCELLED' ? 'timeline-step done' : 'timeline-step'} key={status}><span>{index <= currentIndex && order.status !== 'CANCELLED' ? '✓' : index + 1}</span><strong>{status}</strong></div>)}</div></section><section className="section customer-card"><div className="section-kicker">CUSTOMER</div><h2>{order.customerName}</h2><p className="muted">{order.customerPhone || 'No phone number'}</p><p className="muted">{order.customerEmail || 'No email address'}</p><h3>Shipping address</h3><p className="admin-readable-address">{formatAddress(order.shippingAddress)}</p></section></div>
    <section className="section order-items-card"><div className="section-head"><div><div className="section-kicker">ORDER CONTENTS</div><h2>Products</h2><p className="muted">{order.items.length} line items</p></div><div className="order-items-total">৳{Number(order.total).toLocaleString()}</div></div><div className="admin-table-wrap"><table className="table order-items-table"><thead><tr><th>Product</th><th>Selected options</th><th>Quantity</th><th>Unit price</th><th>Total</th></tr></thead><tbody>{order.items.map(item => { const labels = getOptionLabels(item); return <tr key={item.id}><td><div className="admin-order-product"><div className="admin-order-product-image">{item.product?.images?.[0]?.url ? <img src={item.product.images[0].url} alt="" /> : <Package size={19} />}</div><div><strong>{item.productName}</strong><small className="admin-item-sku">{item.product?.sku || ''}</small></div></div></td><td><div className="admin-order-options">{labels.length ? labels.map(label => <span key={label}>{label}</span>) : <em>Default option</em>}</div></td><td>{item.quantity}</td><td>৳{Number(item.unitPrice).toLocaleString()}</td><td><strong>৳{(Number(item.unitPrice) * item.quantity).toLocaleString()}</strong></td></tr>; })}</tbody></table></div><div className="order-admin-total"><span>Subtotal</span><b>৳{Number(order.subtotal).toLocaleString()}</b><span>Discount</span><b>-৳{Number(order.discount).toLocaleString()}</b><span>Shipping</span><b>৳{Number(order.shippingCharge).toLocaleString()}</b><strong>Total</strong><strong>৳{Number(order.total).toLocaleString()}</strong></div></section>
    <section className="section payment-card"><div><div className="section-kicker">PAYMENT</div><h2>{order.paymentMethod}</h2></div><span className="status">{order.paymentStatus}</span></section>
  </>;
}
