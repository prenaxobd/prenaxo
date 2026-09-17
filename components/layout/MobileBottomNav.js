'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/cart/CartProvider';

/* =========================================================
   CUSTOM SVG ICONS
   ========================================================= */

function HomeIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.5 10.8L12 3.8L20.5 10.8V19.2C20.5 19.97 19.87 20.6 19.1 20.6H4.9C4.13 20.6 3.5 19.97 3.5 19.2V10.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8.5 20.5V14.2C8.5 13.65 8.95 13.2 9.5 13.2H14.5C15.05 13.2 15.5 13.65 15.5 14.2V20.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M2.8 10.9L11.2 4C11.66 3.62 12.34 3.62 12.8 4L21.2 10.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Top Left */}
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      {/* Top Right */}
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      {/* Bottom Left */}
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      {/* Bottom Right */}
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CartIcon({ className = '' }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 4.5h2.2l1.8 9.4a1.8 1.8 0 0 0 1.8 1.5h7.6a1.8 1.8 0 0 0 1.7-1.4L20.5 7H6.2" />

      <circle
        cx="9.5"
        cy="19"
        r="1"
      />

      <circle
        cx="17"
        cy="19"
        r="1"
      />
    </svg>
  );
}

function SearchIcon({ className = '' }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
      />
    </svg>
  );
}

function UserIcon({ className = '' }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />

      <circle
        cx="12"
        cy="7"
        r="4"
      />
    </svg>
  );
}

/* =========================================================
   MOBILE BOTTOM NAV
   ========================================================= */

export default function MobileBottomNav() {
  const pathname = usePathname();
  const cart = useCart();

  const isHome =
    pathname === '/';

  const isUser =
    pathname === '/account' ||
    pathname.startsWith('/account/');

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile navigation"
    >
      {/* HOME */}
      <Link
        href="/"
        className={isHome ? 'active' : ''}
        aria-label="Home"
      >
        <HomeIcon />
        <span>Home</span>
      </Link>

      {/* MENU */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={() =>
          window.dispatchEvent(
            new Event('open-mobile-menu')
          )
        }
      >
        <MenuIcon />
        <span>Menu</span>
      </button>

      {/* CART */}
      <button
        type="button"
        className="mobile-nav-cart"
        aria-label="Open cart"
        onClick={() => cart?.open()}
      >
        <span className="mobile-nav-icon-wrap">
          <CartIcon />

          {cart?.count > 0 && (
            <b className="mobile-cart-badge">
              {cart.count > 99
                ? '99+'
                : cart.count}
            </b>
          )}
        </span>

        <span>Cart</span>
      </button>

      {/* SEARCH */}
      <button
        type="button"
        aria-label="Open search"
        onClick={() =>
          window.dispatchEvent(
            new Event('open-mobile-search')
          )
        }
      >
        <SearchIcon />
        <span>Search</span>
      </button>

      {/* USER */}
      <Link
        href={isUser ? '/account' : '/register'}
        className={isUser ? 'active' : ''}
        aria-label="Account"
      >
        <UserIcon />
        <span>User</span>
      </Link>
    </nav>
  );
}