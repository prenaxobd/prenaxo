'use client';

import { useState } from 'react';

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function search(event) {
    event.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || data?.error || 'Order not found.');
      }

      setOrder(data.order || data);
    } catch (err) {
      setError(err.message || 'Unable to track order.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container page-title">
      <div className="eyebrow">Delivery updates</div>
      <h1>Track your order</h1>

      <form className="form" onSubmit={search}>
        <label>
          Order number
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="1789015935054 or KB-..."
          />
        </label>

        <label>
          Phone number
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01608069154"
          />
        </label>

        <button className="btn" disabled={loading}>
          {loading ? 'Tracking...' : 'Find order'}
        </button>

        {error && (
          <p role="alert" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}
      </form>

      {order && (
        <div className="form" style={{ marginTop: 24 }}>
          <h2>{order.orderNumber}</h2>
          <p className="muted">
            {order.customerName} · ৳{Number(order.total || 0).toLocaleString()}
          </p>
          <p style={{ color: 'var(--green)', fontWeight: 800 }}>
            Current status: {order.status}
          </p>
          <p className="muted">Payment: {order.paymentStatus}</p>

          {Array.isArray(order.items) && order.items.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <h3>Products</h3>

              {order.items.map((item) => (
                <div key={item.id || item.productId} style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
                  {item.image ? (
                    <img
                      src={item.image.url || item.image}
                      alt={item.productName}
                      style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8 }}
                    />
                  ) : null}

                  <div style={{ flex: 1 }}>
                    <strong>{item.productName}</strong>
                    <div className="muted">
                      Qty: {item.quantity} · ৳{Number(item.unitPrice || 0).toLocaleString()}
                    </div>
                  </div>

                  <strong>৳{Number(item.subtotal || 0).toLocaleString()}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
