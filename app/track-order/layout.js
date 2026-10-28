import { getPageMetadata } from '@/lib/seo';

export const metadata = getPageMetadata({
  title: 'Track Order',
  description: 'Check the status of a Prenaxo order.',
  path: '/track-order',
  robots: { index: false, follow: true },
});

export default function TrackOrderLayout({ children }) {
  return children;
}