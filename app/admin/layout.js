import { getPageMetadata } from '@/lib/seo';

export const metadata = {
  ...getPageMetadata({
    title: 'Admin',
    description: 'Prenaxo administration.',
    path: '/admin',
    robots: { index: false, follow: false },
  }),
  icons: {
    icon: '/uploads/site_icon.png',
    shortcut: '/uploads/site_icon.png',
    apple: '/uploads/site_icon.png',
  },
};

export default function AdminRootLayout({ children }) {
  return children;
}
