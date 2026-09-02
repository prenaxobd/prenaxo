import './globals.css';

import StorefrontShell from '@/components/layout/StorefrontShell';

export const metadata = {
  title: 'Khatibazar | Everyday essentials, thoughtfully chosen',
  description:
    'A modern Bangladeshi marketplace for quality everyday goods.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StorefrontShell>
          {children}
        </StorefrontShell>
      </body>
    </html>
  );
}