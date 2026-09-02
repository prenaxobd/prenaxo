'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import StickyCartButton from '@/components/StickyCartButton';
import { CartProvider } from '@/components/cart/CartProvider';

export default function StorefrontShell({ children }) {
  const pathname = usePathname();

  const isAdmin =
    pathname === '/admin' || pathname.startsWith('/admin/');

  const isCheckout = pathname === '/checkout';

  // Admin page
  if (isAdmin) {
    return children;
  }

  return (
    <CartProvider>
      <Header />

      {children}

      <Footer />
      <MobileBottomNav />

      {/* Sticky cart checkout page-এ দেখাবে না */}
      {!isCheckout && <StickyCartButton />}
    </CartProvider>
  );
}