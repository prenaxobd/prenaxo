import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import styles from './OrderStatusNotice.module.css';

const confirmedMessage = 'আপনার পেমেন্টটি সফলভাবে যাচাই করা হয়েছে এবং অর্ডারটি কনফার্ম করা হয়েছে! আমাদের টিম দ্রুত আপনার প্রোডাক্টটি ডেলিভারির জন্য প্রস্তুত করছে।';
const cancelledMessage = 'দুঃখিত! আপনার প্রদানকৃত পেমেন্ট বা ট্রানজেকশন আইডিটি সঠিক পাওয়া যায়নি। অনুগ্রহ করে সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন অথবা আমাদের সাপোর্টে যোগাযোগ করুন।';

export default function OrderStatusNotice({ status, paymentStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className={`${styles.notice} ${styles.cancelled}`} role="alert">
        <AlertTriangle size={21} aria-hidden="true" />
        <p>{cancelledMessage}</p>
      </div>
    );
  }

  if (
    paymentStatus === 'PAID' &&
    ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status)
  ) {
    return (
      <div className={`${styles.notice} ${styles.confirmed}`} role="status">
        <CheckCircle2 size={21} aria-hidden="true" />
        <p>{confirmedMessage}</p>
      </div>
    );
  }

  return null;
}
