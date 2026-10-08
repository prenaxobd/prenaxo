'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import StickyCartButton from '@/components/StickyCartButton';
import HelpCenterButton from '@/components/layout/HelpCenterButton';
import ScrollToTopButton from '@/components/layout/ScrollToTopButton';
import { CartProvider } from '@/components/cart/CartProvider';
import { WishlistProvider } from '@/components/wishlist/WishlistProvider';
import { AccountRequiredProvider } from '@/components/auth/AccountRequiredProvider';

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
    <AccountRequiredProvider>
      <WishlistProvider>
        <CartProvider>
          <Header />

          {children}

          {footer}
          <MobileBottomNav />

          {/* Help center appears on all customer-facing pages */}
          <HelpCenterButton />
          <ScrollToTopButton />

          {/* Sticky cart checkout page-এ দেখাবে না */}
          {!isCheckout && <StickyCartButton />}
        </CartProvider>
      </WishlistProvider>
    </AccountRequiredProvider>
  );
}