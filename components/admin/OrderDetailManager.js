'use client';
import OptimizedImage from '@/components/OptimizedImage';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Package } from 'lucide-react';

const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderDetailManager({ initialOrder }) {
  const [order, setOrder] = useState(initialOrder);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');
  const timeline = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentIndex = timeline.indexOf(order.status);
  const isManualPayment = ['BANK_TRANSFER', 'MANUAL_WALLET'].includes(order.paymentMethodType);
  const needsPaymentReview = order.paymentStatus === 'PENDING_VERIFICATION' || (isManualPayment && order.paymentStatus === 'PENDING');
  const gatewayNeedsReview = order.paymentMethodType === 'GATEWAY' && order.paymentStatus === 'PENDING_VERIFICATION';
  const cashPending = order.paymentMethodType === 'COD' && order.paymentStatus === 'PENDING';

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
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) setMessage(result.error || 'Unable to update order.');
      else {
        setOrder(current => ({ ...current, ...result }));
        if (data.paymentStatus) setPaymentNote('');
        setMessage('Order updated.');
      }
    } catch {
      setMessage('Unable to update order. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return <>
    <div className="section-head order-detail-heading"><div><div className="eyebrow">Fulfilment</div><h1>{order.orderNumber}</h1><p className="muted">Placed {new Date(order.createdAt).toLocaleDateString()}</p></div><div className="order-detail-actions"><button className="btn order-copy-btn" type="button" onClick={copyOrderDetails}><Copy size={15} /> Copy order details</button><Link className="btn" href="/admin/orders">Back to orders</Link></div></div>
    {message && <p className="admin-message"><Check size={15} /> {message}</p>}
    <div className="order-admin-grid"><section className="section order-status-card"><div className="section-head"><div><h2>Order status</h2><p className="muted">Update fulfilment and review payments separately.</p></div></div><label>Order status<select value={order.status} disabled={saving} onChange={event => update({ status: event.target.value })}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label><div className="order-timeline">{timeline.map((status, index) => <div className={index <= currentIndex && order.status !== 'CANCELLED' ? 'timeline-step done' : 'timeline-step'} key={status}><span>{index <= currentIndex && order.status !== 'CANCELLED' ? '✓' : index + 1}</span><strong>{status}</strong></div>)}</div></section><section className="section customer-card"><div className="section-kicker">CUSTOMER</div><h2>{order.customerName}</h2><p className="muted">{order.customerPhone || 'No phone number'}</p><p className="muted">{order.customerEmail || 'No email address'}</p><h3>Shipping address</h3><p className="admin-readable-address">{formatAddress(order.shippingAddress)}</p></section></div>
    <section className="section order-items-card"><div className="section-head"><div><div className="section-kicker">ORDER CONTENTS</div><h2>Products</h2><p className="muted">{order.items.length} line items</p></div><div className="order-items-total">৳{Number(order.total).toLocaleString()}</div></div><div className="admin-table-wrap"><table className="table order-items-table"><thead><tr><th>Product</th><th>Selected options</th><th>Quantity</th><th>Unit price</th><th>Total</th></tr></thead><tbody>{order.items.map(item => { const labels = getOptionLabels(item); return <tr key={item.id}><td><div className="admin-order-product"><div className="admin-order-product-image">{item.product?.images?.[0]?.url ? <OptimizedImage src={item.product.images[0].url} alt="" /> : <Package size={19} />}</div><div><strong>{item.productName}</strong><small className="admin-item-sku">{item.product?.sku || ''}</small></div></div></td><td><div className="admin-order-options">{labels.length ? labels.map(label => <span key={label}>{label}</span>) : <em>Default option</em>}</div></td><td>{item.quantity}</td><td>৳{Number(item.unitPrice).toLocaleString()}</td><td><strong>৳{(Number(item.unitPrice) * item.quantity).toLocaleString()}</strong></td></tr>; })}</tbody></table></div><div className="order-admin-total"><span>Subtotal</span><b>৳{Number(order.subtotal).toLocaleString()}</b><span>Discount</span><b>-৳{Number(order.discount).toLocaleString()}</b><span>Shipping</span><b>৳{Number(order.shippingCharge).toLocaleString()}</b><strong>Total</strong><strong>৳{Number(order.total).toLocaleString()}</strong></div></section>
    <section className="section payment-card"><div><div className="section-kicker">PAYMENT</div><h2>{order.paymentMethodName}</h2><p className="muted">{order.paymentMethod} · {order.paymentMethodType}</p></div><span className="status">{order.paymentStatus.replaceAll('_', ' ')}</span>
      {order.paymentTransactionId && <div className="payment-reference-summary"><span>Customer transfer reference</span><strong>{order.paymentTransactionId}</strong></div>}
      {(needsPaymentReview || cashPending) && <div className="payment-review-controls"><label>Review note<textarea value={paymentNote} onChange={event => setPaymentNote(event.target.value)} maxLength={500} rows={3} placeholder="Record what you checked or received" disabled={saving} /></label><div>{needsPaymentReview ? <><button type="button" className="btn" disabled={saving || paymentNote.trim().length < 5} onClick={() => update({ paymentStatus: 'PAID', paymentNote })}>{gatewayNeedsReview ? 'Accept verified payment' : 'Approve payment'}</button>{!gatewayNeedsReview && <button type="button" className="btn order-payment-reject" disabled={saving || paymentNote.trim().length < 5} onClick={() => update({ paymentStatus: 'FAILED', paymentNote })}>Reject reference</button>}</> : <button type="button" className="btn" disabled={saving || paymentNote.trim().length < 5} onClick={() => update({ paymentStatus: 'PAID', paymentNote })}>Confirm cash collected</button>}</div></div>}
    </section>
    <section className="section payment-history"><div className="section-kicker">AUDIT TRAIL</div><h2>Payment activity</h2>{order.paymentEvents?.length ? <ol>{order.paymentEvents.map(event => <li key={event.id}><div><strong>{event.status.replaceAll('_', ' ')}</strong><span>{event.source}</span></div><p>{event.note || 'Status recorded.'}</p><small>{new Date(event.createdAt).toLocaleString('en-GB')} · {event.actor?.name || (event.source === 'GATEWAY' ? 'SSLCommerz' : 'System')}</small></li>)}</ol> : <p className="muted">No payment activity recorded yet.</p>}</section>
  </>;
}
