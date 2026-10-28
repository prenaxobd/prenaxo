import { getPageMetadata } from '@/lib/seo';

export const metadata = getPageMetadata({
  title: 'Wishlist',
  description: 'View products saved to your Prenaxo wishlist.',
  path: '/wishlist',
  robots: { index: false, follow: true },
});

export default function WishlistLayout({ children }) {
  return children;
}