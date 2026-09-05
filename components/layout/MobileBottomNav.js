'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCartShopping, faMagnifyingGlass, faTag, faUser } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/components/cart/CartProvider';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const cart = useCart();
  const accountHref = pathname === '/account' ? '/account' : '/account';
  return <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
    <button type="button" onClick={() => window.dispatchEvent(new Event('open-mobile-menu'))}><FontAwesomeIcon icon={faBars} /><span>Menu</span></button>
    <Link className={pathname === '/flash-sale' ? 'active' : ''} href="/flash-sale"><FontAwesomeIcon icon={faTag} /><span>Offers</span></Link>
    <button type="button" className="mobile-nav-cart" onClick={() => cart?.open()}><FontAwesomeIcon icon={faCartShopping} /><span>Cart</span>{cart?.count > 0 && <b className="mobile-cart-badge">{cart.count > 99 ? '99+' : cart.count}</b>}</button>
    <button type="button" onClick={() => window.dispatchEvent(new Event('open-mobile-search'))}><FontAwesomeIcon icon={faMagnifyingGlass} /><span>Search</span></button>
    <Link className={pathname === accountHref ? 'active' : ''} href={accountHref}><FontAwesomeIcon icon={faUser} /><span>Account</span></Link>
  </nav>;
}