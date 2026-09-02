'use client';

import Link from 'next/link';

import {
  Menu,
  Search,
  Heart,
  ShoppingBag,
  UserRound,
  MapPin,
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { useCart } from '@/components/cart/CartProvider';

export default function Header() {
  const cart = useCart();

  const [menuOpen, setMenuOpen] = useState(false);

  const [wishlistCount, setWishlistCount] = useState(0);

  // Logged-in user
  const [user, setUser] = useState(null);

  const [userLoading, setUserLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | LOAD CURRENT USER
  |--------------------------------------------------------------------------
  */

  async function loadCurrentUser() {
    try {
      const response = await fetch('/api/auth/me', {
        cache: 'no-store',
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();

      setUser(data?.user || null);
    } catch (error) {
      console.error('Current user error:', error);

      setUser(null);
    } finally {
      setUserLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD WISHLIST COUNT
  |--------------------------------------------------------------------------
  */

  async function loadWishlistCount() {
    try {
      const response = await fetch('/api/wishlist', {
        cache: 'no-store',
      });

      if (!response.ok) {
        setWishlistCount(0);
        return;
      }

      const data = await response.json();

      const items = Array.isArray(data?.items)
        ? data.items
        : [];

      setWishlistCount(items.length);
    } catch (error) {
      console.error('Wishlist count error:', error);

      setWishlistCount(0);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadCurrentUser();
    loadWishlistCount();

    /*
     * Wishlist update
     */
    function handleWishlistUpdate(event) {
      if (
        event?.detail &&
        typeof event.detail.count === 'number'
      ) {
        setWishlistCount(event.detail.count);
        return;
      }

      loadWishlistCount();
    }

    /*
     * User profile update
     *
     * Profile page থেকে event dispatch করলে
     * Header নতুন image/name load করবে।
     */
    function handleUserUpdated() {
      loadCurrentUser();
    }

    /*
     * Browser focus
     */
    function handleFocus() {
      loadCurrentUser();
      loadWishlistCount();
    }

    window.addEventListener(
      'wishlist-updated',
      handleWishlistUpdate
    );

    window.addEventListener(
      'user-updated',
      handleUserUpdated
    );

    window.addEventListener(
      'focus',
      handleFocus
    );

    return () => {
      window.removeEventListener(
        'wishlist-updated',
        handleWishlistUpdate
      );

      window.removeEventListener(
        'user-updated',
        handleUserUpdated
      );

      window.removeEventListener(
        'focus',
        handleFocus
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | PROFILE IMAGE
  |--------------------------------------------------------------------------
  */

  const profileImage =
    user?.image || null;

  /*
  |--------------------------------------------------------------------------
  | USER NAME
  |--------------------------------------------------------------------------
  */

  const userName =
    user?.name?.trim() || 'Account';

  return (
    <>
      {/* ANNOUNCEMENT */}

      <div className="announcement">
        Fast delivery across Bangladesh · Secure payment · Customer support
      </div>

      {/* HEADER */}

      <header className="header">
        <div className="container header-row">

          {/* MOBILE MENU */}

          <button
            className="mobile-menu-button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen((value) => !value)
            }
          >
            <Menu size={22} />
          </button>

          {/* LOGO */}

          <Link
            className="logo"
            href="/"
          >
            k<span>h</span>atibazar
          </Link>

          {/* SEARCH */}

          <form
            className="search"
            action="/search"
          >
            <input
              name="q"
              placeholder="Search for products, brands and categories..."
              aria-label="Search products"
            />

            <Search size={18} />
          </form>

          {/* NAV ACTIONS */}

          <div className="nav-actions">

            {/* TRACK ORDER */}

            <Link
              className="icon-link track-link"
              href="/track-order"
            >
              <MapPin size={18} />

              <span>
                Track order
              </span>
            </Link>


            {/* ACCOUNT */}

            <Link
              className={`icon-link account-link ${
                user ? 'logged-in' : ''
              }`}
              href="/account"
              aria-label={
                user
                  ? `Account of ${userName}`
                  : 'Account'
              }
            >

              {userLoading ? (
                <UserRound
                  size={19}
                />
              ) : profileImage ? (

                <img
                  src={profileImage}
                  alt={userName}
                  className="header-profile-image"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      'none';

                    const fallback =
                      event.currentTarget
                        .nextElementSibling;

                    if (fallback) {
                      fallback.style.display =
                        'inline-flex';
                    }
                  }}
                />

              ) : null}

              {/* FALLBACK USER ICON */}

              <span
                className="header-profile-fallback"
                style={{
                  display:
                    profileImage
                      ? 'none'
                      : 'inline-flex',
                }}
              >
                <UserRound size={19} />
              </span>

              {/* DESKTOP USER NAME */}

              <span className="account-text">

                {user
                  ? userName
                  : 'Account'}

              </span>

            </Link>


            {/* WISHLIST */}

            <Link
              className="icon-link wishlist-link"
              href="/wishlist"
            >

              <span
                className="wishlist-icon-wrap"
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >

                <Heart
                  size={19}
                  fill={
                    wishlistCount > 0
                      ? 'currentColor'
                      : 'none'
                  }
                />

                <span>
                  Wishlist
                </span>

                {wishlistCount > 0 && (
                  <i
                    className="count wishlist-count"
                    aria-label={`${wishlistCount} wishlist items`}
                  >
                    {wishlistCount > 99
                      ? '99+'
                      : wishlistCount}
                  </i>
                )}

              </span>

            </Link>


            {/* BAG */}

            <button
              className="icon-link cart-trigger"
              type="button"
              onClick={() =>
                cart?.open()
              }
            >

              <ShoppingBag size={19} />

              <span>
                Bag
              </span>

              <i className="count">
                {cart?.count || 0}
              </i>

            </button>

          </div>
        </div>


        {/* NAVIGATION */}

        <nav
          className={`nav ${
            menuOpen
              ? 'is-open'
              : ''
          }`}
        >

          <div className="container nav-inner">

            <Link
              href="/"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Home
            </Link>

            <Link
              href="/shop-menu"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Shop menu
            </Link>

            <Link
              href="/shop"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Shop all
            </Link>

            <Link
              href="/combos"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Combos
            </Link>

            <Link
              href="/flash-sale"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Flash sale
            </Link>

            <Link
              href="/about"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              About
            </Link>

            <Link
              href="/contact"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Contact
            </Link>

          </div>

        </nav>

      </header>
    </>
  );
}