'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
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
  const [verifiedPayment, setVerifiedPayment] = useState(null);
  const purchaseTracked = useRef(false);

  useEffect(() => {
    if (!ready || !order?.orderNumber) return undefined;

    let active = true;
    let attempts = 0;
    const refreshPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(order.orderNumber)}/payment-status`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (active) setVerifiedPayment(data);
      } catch {
        // Preserve the saved receipt state when the status endpoint is temporarily unavailable.
      }
    };

    refreshPaymentStatus();
    const interval = window.setInterval(() => {
      attempts += 1;
      if (attempts >= 20) {
        window.clearInterval(interval);
        return;
      }
      refreshPaymentStatus();
    }, 3000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [ready, order?.orderNumber]);

  const paymentStatus = verifiedPayment?.paymentStatus || order?.paymentStatus;
  const paymentMethodType = verifiedPayment?.paymentMethodType || order?.paymentMethodType;
  const paymentMethodName = verifiedPayment?.paymentMethodName || order?.paymentMethodName || order?.paymentMethod;

  useEffect(() => {
    if (paymentStatus !== 'PAID' || purchaseTracked.current || !order) return;
    purchaseTracked.current = true;
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', { currency: 'BDT', value: Number(order.total) });
    }
  }, [order, paymentStatus]);

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
          <p className={styles.eyebrow}>{order ? 'Order received' : 'Order summary'}</p>
          <h1>{order ? paymentStatus === 'PAID' ? 'Payment received.' : paymentStatus === 'FAILED' ? 'Payment not completed.' : 'Your order is in good hands.' : 'Order details unavailable'}</h1>
          <p className={styles.intro}>
            {order
              ? paymentStatus === 'PAID'
                ? 'Your payment has been verified. We will keep you updated as your order moves forward.'
                : paymentStatus === 'PENDING_VERIFICATION'
                  ? 'We received your transfer reference. Our team will review it and update the payment status.'
                  : paymentStatus === 'FAILED'
                    ? 'The payment was not completed. Your order remains unpaid; contact support before trying again.'
                    : paymentStatus === 'REFUNDED'
                      ? 'A refund has been recorded for this order. Contact support if you need help.'
                      : paymentMethodType === 'COD'
                        ? 'Your order is confirmed. Payment is due when your order is delivered.'
                        : ['BANK_TRANSFER', 'MANUAL_WALLET'].includes(paymentMethodType)
                          ? 'Your order has been received. Our team will follow up with payment instructions.'
                          : 'Your payment confirmation is pending. This page will update when the provider confirms it.'
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
                  <span /> {String(paymentStatus || 'PENDING').replaceAll('_', ' ')}
                </span>
              </div>

              <dl className={styles.details}>
                <div className={styles.detailRow}>
                  <dt>Order ID</dt>
                  <dd className={styles.orderNumber}>{order.orderNumber}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Payment method</dt>
                  <dd>{paymentMethodName === 'Cash on Delivery' ? 'Cash on delivery' : paymentMethodName}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>Payment status</dt>
                  <dd className={styles.paymentStatus}>
                    <Clock3 size={15} aria-hidden="true" /> {String(paymentStatus || 'PENDING').replaceAll('_', ' ')}
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