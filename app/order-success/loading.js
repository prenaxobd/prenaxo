import { LoaderCircle } from 'lucide-react';
import styles from './order-success.module.css';

export default function Loading() {
  return (
    <main className={styles.loadingPage}>
      <section className={styles.loadingReceipt} aria-live="polite">
        <span className={styles.loadingIcon}>
          <LoaderCircle size={24} aria-hidden="true" />
        </span>
        <h1>Preparing your order summary</h1>
        <p>Your order is being confirmed. This should only take a moment.</p>
      </section>
    </main>
  );
}