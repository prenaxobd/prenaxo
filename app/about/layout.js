import { getPageMetadata } from '@/lib/seo';

export const metadata = getPageMetadata({
  title: 'About',
  description:
    'Learn about Prenaxo, its online marketplace, product selection and service for customers in Bangladesh.',
  path: '/about',
});

export default function AboutLayout({ children }) {
  return children;
}
