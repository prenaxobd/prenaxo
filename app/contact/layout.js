import { getPageMetadata } from '@/lib/seo';

export const metadata = getPageMetadata({
  title: 'Contact',
  description:
    'Contact Prenaxo with questions about products, orders, payments, delivery or customer support in Bangladesh.',
  path: '/contact',
});

export default function ContactLayout({ children }) {
  return children;
}
