'use client';

import OptimizedImage from '@/components/OptimizedImage';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import styles from './track-order.module.css';

const orderSteps = [
  { label: 'Order placed', status: 'PENDING', Icon: CheckCircle2 },
  { label: 'Processing', status: 'PROCESSING', Icon: PackageCheck },
  { label: 'On the way', status: 'SHIPPED', Icon: Truck },
  { label: 'Delivered', status: 'DELIVERED', Icon: Check },
];

function formatLabel(value) {
  return String(value || 'Pending')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatMoney(value) {
  return `৳${Number(value || 0).toLocaleString('en-BD')}`;
}

function getAddress(shippingAddress) {
  if (!shippingAddress) return '';
  if (typeof shippingAddress === 'string') return shippingAddress;
  return Object.values(shippingAddress).filter(Boolean).join(', ');
}

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
        throw new Error(data?.message || data?.error || 'We could not find an order with those details.');
      }

      setOrder(data.order || data);
    } catch (err) {
      setError(err.message || 'Unable to track your order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const orderStatus = String(order?.status || 'PENDING').toUpperCase();
  const currentStep = orderSteps.findIndex((step) => step.status === orderStatus);
  const cancelled = orderStatus === 'CANCELLED';
  const address = getAddress(order?.shippingAddress);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero} aria-labelledby="track-title">
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              Order tracking
            </div>
            <h1 id="track-title">Your order,<br />in the <span>right hands.</span></h1>
            <p className={styles.intro}>
              From our door to yours. Get a clear view of your order status whenever you need it.
            </p>
            <div className={styles.trustNote}>
              <ShieldCheck size={18} aria-hidden="true" />
              <span>Your order details are private and secure.</span>
            </div>
          </div>

          <form className={styles.lookupCard} onSubmit={search}>
            <div className={styles.cardIcon}>
              <Search size={21} aria-hidden="true" />
            </div>
            <div className={styles.cardHeading}>
              <p className={styles.cardEyebrow}>Let’s find it</p>
              <h2>Track your order</h2>
              <p>Enter the details used at checkout.</p>
            </div>

            <label className={styles.field}>
              <span>Order number</span>
              <input
                required
                autoComplete="off"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="e.g. KB-1789015935054"
              />
            </label>

            <label className={styles.field}>
              <span>Phone number</span>
              <input
                required
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="The number used at checkout"
              />
            </label>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button className={styles.submitButton} type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className={styles.spinner} size={18} aria-hidden="true" />
                  Finding your order
                </>
              ) : (
                <>
                  Find my order <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
            <p className={styles.formHint}>
              <span aria-hidden="true">?</span>
              Your order number is in your confirmation message.
            </p>
          </form>
        </section>

        {order && (
          <section className={styles.result} aria-labelledby="result-title" aria-live="polite">
            <div className={styles.resultHeader}>
              <div>
                <p className={styles.resultEyebrow}>Order details</p>
                <h2 id="result-title">A little update for you</h2>
              </div>
              <span className={`${styles.statusBadge} ${cancelled ? styles.cancelledBadge : ''}`}>
                <span />
                {formatLabel(order.status)}
              </span>
            </div>

            {cancelled ? (
              <div className={styles.cancelledNotice}>
                <Clock3 size={19} aria-hidden="true" />
                <p>This order has been cancelled. Please contact our support team if you need help.</p>
              </div>
            ) : (
              <div className={styles.timeline} aria-label={`Order status: ${formatLabel(order.status)}`}>
                {orderSteps.map(({ label, status, Icon }, index) => {
                  const complete = currentStep >= 0 && index < currentStep;
                  const active = currentStep === index;
                  return (
                    <div
                      className={`${styles.timelineStep} ${complete ? styles.completeStep : ''} ${active ? styles.activeStep : ''}`}
                      key={status}
                    >
                      <div className={styles.stepMarker}>
                        {complete ? <Check size={16} aria-hidden="true" /> : <Icon size={17} aria-hidden="true" />}
                      </div>
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={styles.orderMeta}>
              <div>
                <span>Order number</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div>
                <span>Placed on</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>
              <div>
                <span>Payment</span>
                <strong className={styles.paymentValue}>
                  <CreditCard size={15} aria-hidden="true" />
                  {formatLabel(order.paymentStatus)}
                </strong>
              </div>
            </div>

            {Array.isArray(order.items) && order.items.length > 0 && (
              <div className={styles.products}>
                <div className={styles.sectionHeading}>
                  <h3>In this order</h3>
                  <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                </div>
                {order.items.map((item, index) => (
                  <div className={styles.product} key={item.id || `${item.productId}-${index}`}>
                    <div className={styles.productImage}>
                      {item.image ? (
                        <OptimizedImage
                          src={item.image.url || item.image}
                          alt={item.productName || 'Order product'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <PackageCheck size={22} aria-hidden="true" />
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <strong>{item.productName}</strong>
                      <span>Qty {item.quantity} · {formatMoney(item.unitPrice)} each</span>
                    </div>
                    <strong className={styles.productTotal}>{formatMoney(item.subtotal)}</strong>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.orderFooter}>
              {address && (
                <div className={styles.deliveryAddress}>
                  <MapPin size={17} aria-hidden="true" />
                  <div>
                    <span>Delivering to</span>
                    <strong>{address}</strong>
                  </div>
                </div>
              )}
              <div className={styles.total}>
                <span>Order total</span>
                <strong>{formatMoney(order.total)}</strong>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
