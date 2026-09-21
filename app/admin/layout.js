export const metadata = {
  title: 'Prenaxo Admin',
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: '/uploads/site_icon.png',
    shortcut: '/uploads/site_icon.png',
    apple: '/uploads/site_icon.png',
  },
};

export default function AdminRootLayout({ children }) {
  return children;
}
