import { getPageMetadata } from '@/lib/seo';

export const metadata = getPageMetadata({
  title: 'Account',
  description: 'Manage your Prenaxo account.',
  path: '/account',
  robots: { index: false, follow: true },
});

export default function AccountLayout({ children }) {
  return children;
}