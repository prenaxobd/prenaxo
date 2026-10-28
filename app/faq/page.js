import FaqPage from '@/components/faq/FaqPage';
import { getPageMetadata } from '@/lib/seo';

export const metadata = getPageMetadata({
  title: 'Frequently Asked Questions',
  description:
    'Find answers about placing orders, payments, delivery, tracking, returns and getting help with your Prenaxo order.',
  path: '/faq',
});

export default function FAQ() {
  return <FaqPage />;
}
