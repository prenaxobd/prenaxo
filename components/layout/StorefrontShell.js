'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import StickyCartButton from '@/components/StickyCartButton';
import HelpCenterButton from '@/components/layout/HelpCenterButton';
import { CartProvider } from '@/components/cart/CartProvider';

export default function StorefrontShell({ children, footer }) {
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

      {footer}
      <MobileBottomNav />

      {/* Help center appears on all customer-facing pages */}
      <HelpCenterButton />

      {/* Sticky cart checkout page-এ দেখাবে না */}
      {!isCheckout && <StickyCartButton />}
    </CartProvider>
  );
}