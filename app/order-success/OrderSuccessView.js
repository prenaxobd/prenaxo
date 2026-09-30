'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { ArrowRight, Check, Clock3, PackageCheck } from 'lucide-react';
import styles from './order-success.module.css';

function subscribeToOrderStorage() {
  return () => {};
}

function getOrderSnapshot(orderNumber) {
  try {
    const savedOrder = sessionStorage.getItem('prenaxo-order-confirmation');
    const parsedOrder = savedOrder ? JSON.parse(savedOrder) : null;
    return parsedOrder?.orderNumber === orderNumber ? savedOrder : null;
  } catch {
    return null;
  }
}

export default function OrderSuccessView({ orderNumber }) {
  const orderSnapshot = useSyncExternalStore(
    subscribeToOrderStorage,
    () => getOrderSnapshot(orderNumber),
    () => '__loading__'
  );
  const ready = orderSnapshot !== '__loading__';
  const order = ready && orderSnapshot ? JSON.parse(orderSnapshot) : null;

  if (!ready) {
    return (
      <main className={styles.loadingPage}>
        <section className={styles.loadingReceipt} aria-live="polite">
          <h1>Loading your receipt</h1>
          <p>Your order is being confirmed. This should only take a moment.</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.successMark}>
            <Check size={27} strokeWidth={2.5} />
          </div>
          <p className={styles.eyebrow}>{order ? 'Order confirmed' : 'Order summary'}</p>
          <h1>{order ? 'Your order is in good hands.' : 'Order details unavailable'}</h1>
          <p className={styles.intro}>
            {order
              ? 'Thank you for shopping with Prenaxo. We have received your order and will keep you updated as it moves forward.'
              : 'We could not load this order. Please check your order link or contact our support team.'}
          </p>
        </header>

        {order ? (
          <>
            <section className={styles.receipt} aria-labelledby="receipt-title">
              <div className={styles.receiptHead}>
                <div>
                  <p className={styles.receiptLabel}>Order summary</p>
                  <h2 id="receipt-title">Your receipt</h2>
                </div>
                <span className={styles.status}>
                  <span /> Confirmed
                </span>
              </div>

              <dl className={styles.details}>
                <div className={styles.detailRow}>
                  <dt>Order ID</dt>
                  <dd className={styles.orderNumber}>{order.orderNumber}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Payment method</dt>
                  <dd>{order.paymentMethod === 'COD' ? 'Cash on delivery' : order.paymentMethod}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Payment status</dt>
                  <dd className={styles.paymentStatus}>
                    <Clock3 size={15} aria-hidden="true" /> {order.paymentStatus}
                  </dd>
                </div>
                <div className={`${styles.detailRow} ${styles.totalRow}`}>
                  <dt>Total</dt>
                  <dd>৳{Number(order.total).toLocaleString('en-BD')}</dd>
                </div>
              </dl>
            </section>

            <div className={styles.nextStep}>
              <div className={styles.nextIcon}>
                <PackageCheck size={22} aria-hidden="true" />
              </div>
              <div>
                <h2>What happens next</h2>
                <p>Follow delivery updates and order progress from your tracking page.</p>
              </div>
            </div>

            <nav className={styles.actions} aria-label="Order actions">
              <Link className={styles.trackButton} href="/track-order">
                Track your order <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className={styles.shopLink} href="/shop">Continue shopping</Link>
            </nav>
          </>
        ) : (
          <Link className={styles.trackButton} href="/shop">
            Return to shop <ArrowRight size={17} aria-hidden="true" />
          </Link>
        )}
      </div>
    </main>
  );
}