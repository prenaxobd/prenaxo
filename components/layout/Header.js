'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faMagnifyingGlass,
  faRightFromBracket,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/components/cart/CartProvider';

const placeholderMessages = [
  'Products',
  'Categories',
  'Brands',
  'Honey',
  'Dates',
  'Rice',
];

/* =========================================================
   CUSTOM HEADER SVG ICONS
   ========================================================= */

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
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function WishlistIcon({ className = '' }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
    </svg>
  );
}

function TrackOrderIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Map */}
      <path
        d="M9 39.5L19 35.5L33 40L43 36V15.5L33 19.5L19 15L9 19V39.5Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Map folds */}
      <path
        d="M19 15V35.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      <path
        d="M33 19.5V40"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Location Pin */}
      <path
        d="M26 10.5
           C21.2 10.5 17.5 14.2 17.5 19
           C17.5 25.4 26 32.5 26 32.5
           C26 32.5 34.5 25.4 34.5 19
           C34.5 14.2 30.8 10.5 26 10.5Z"
        fill="white"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pin center */}
      <circle
        cx="26"
        cy="19"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
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
      <circle cx="9.5" cy="19" r="1" />
      <circle cx="17" cy="19" r="1" />
    </svg>
  );
}

function MobileMenuIcon({ className = '' }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 7.5H19" />
      <path d="M5 12H15.5" />
      <path d="M5 16.5H19" />
    </svg>
  );
}

/* =========================================================
   SEARCH RESULT GROUP
   ========================================================= */

function ProductSuggestion({ item, onSelect }) {
  const imageUrl = item?.images?.[0]?.url;
  const price = Number(item?.salePrice ?? item?.regularPrice ?? 0);
  const brandName = item?.brandRelation?.name || item?.brand;

  return (
    <button
      type="button"
      className="header-product-result"
      onClick={onSelect}
      aria-label={`Open product ${item.name}`}
    >
      <span className="header-product-thumb">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
              const placeholder = event.currentTarget.parentElement?.querySelector(
                '.header-product-thumb-placeholder'
              );

              if (placeholder) {
                placeholder.style.display = 'inline-flex';
                return;
              }

              const fallback = document.createElement('span');
              fallback.className = 'header-product-thumb-placeholder';
              fallback.textContent = 'P';
              event.currentTarget.parentElement?.appendChild(fallback);
            }}
          />
        ) : null}
        <span className="header-product-thumb-placeholder" style={{ display: imageUrl ? 'none' : 'inline-flex' }}>
          P
        </span>
      </span>

      <span className="header-product-meta">
        <span className="header-product-name">{item.name}</span>
        <span className="header-product-price">৳{Number(price || 0).toLocaleString('en-BD')}</span>
        {brandName ? <span className="header-product-brand">{brandName}</span> : null}
      </span>
    </button>
  );
}

function ResultGroup({ title, items, onSelect }) {
  if (!items?.length) return null;

  return (
    <div className="header-result-group">
      <strong>{title}</strong>

      {items.map((item) => (
        <Link
          href={item.href}
          key={item.id}
          className="header-result"
          onClick={onSelect}
        >
          <span>{item.name}</span>

          <FontAwesomeIcon icon={faChevronDown} />
        </Link>
      ))}
    </div>
  );
}

function SearchPlaceholder({ queryValue, index }) {
  if (queryValue) return null;

  return (
    <span className="search-placeholder-overlay" aria-hidden="true">
      <span className="search-placeholder-static">Search for</span>
      <span className="search-placeholder-rotator">
        {placeholderMessages.map((item, itemIndex) => (
          <span
            key={item}
            className={`search-placeholder-word ${itemIndex === index ? 'is-visible' : ''}`}
          >
            {item}
          </span>
        ))}
      </span>
    </span>
  );
}

/* =========================================================
   HEADER
   ========================================================= */

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const cart = useCart();

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const searchRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const [results, setResults] = useState({
    products: [],
    categories: [],
    brands: [],
  });

  const [suggestions, setSuggestions] = useState({
    products: [],
    categories: [],
    brands: [],
  });

  const [wishlistCount, setWishlistCount] = useState(0);

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userImageFailed, setUserImageFailed] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [navStuck, setNavStuck] = useState(false);

  /* =======================================================
     LOAD USER
     ======================================================= */

  async function loadUser() {
    try {
      const response = await fetch('/api/auth/me', {
        cache: 'no-store',
      });

      const data = await response.json();

      setUser(data?.user || null);
      setUserImageFailed(false);
    } catch {
      setUser(null);
      setUserImageFailed(false);
    } finally {
      setUserLoading(false);
    }
  }

  /* =======================================================
     LOAD WISHLIST COUNT
     ======================================================= */

  async function loadWishlistCount() {
    try {
      const response = await fetch('/api/wishlist', {
        cache: 'no-store',
      });

      const data = await response.json();

      setWishlistCount(
        Array.isArray(data?.items) ? data.items.length : 0
      );
    } catch {
      setWishlistCount(0);
    }
  }

  /* =======================================================
     LOAD NAVIGATION DATA
     ======================================================= */

  async function loadNavigation(value = '') {
    const nextValue = value.trim();

    if (nextValue) {
      setSearchLoading(true);
    }

    try {
      const response = await fetch(
        `/api/navigation${
          nextValue ? `?q=${encodeURIComponent(nextValue)}` : ''
        }`,
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        if (nextValue) {
          setResults({ products: [], categories: [], brands: [] });
        } else {
          setSuggestions({ products: [], categories: [], brands: [] });
        }
        return;
      }

      const data = await response.json();

      if (nextValue) {
        setResults(data);
      } else {
        setSuggestions(data);
      }
    } catch {
      if (nextValue) {
        setResults({
          products: [],
          categories: [],
          brands: [],
        });
      }
    } finally {
      if (nextValue) {
        setSearchLoading(false);
      }
    }
  }

  /* =======================================================
     INITIAL HEADER EVENTS
     ======================================================= */

  useEffect(() => {
    loadUser();
    loadWishlistCount();
    loadNavigation();

    const onWishlist = (event) => {
      if (typeof event?.detail?.count === 'number') {
        setWishlistCount(event.detail.count);
      } else {
        loadWishlistCount();
      }
    };

    const onUser = () => loadUser();

    const onProfileUpdated = () => {
      // Profile was updated, reload user data
      loadUser();
    };

    const onFocus = () => {
      loadUser();
      loadWishlistCount();
    };

    const onOpenMenu = () => {
      setMenuOpen(true);
    };

    const onOpenSearch = () => {
      setSearchOpen(true);
      setMenuOpen(false);
    };

    window.addEventListener(
      'wishlist-updated',
      onWishlist
    );

    window.addEventListener(
      'user-updated',
      onUser
    );

    window.addEventListener(
      'profile-updated',
      onProfileUpdated
    );

    window.addEventListener(
      'focus',
      onFocus
    );

    window.addEventListener(
      'open-mobile-menu',
      onOpenMenu
    );

    window.addEventListener(
      'open-mobile-search',
      onOpenSearch
    );

    return () => {
      window.removeEventListener(
        'wishlist-updated',
        onWishlist
      );

      window.removeEventListener(
        'user-updated',
        onUser
      );

      window.removeEventListener(
        'profile-updated',
        onProfileUpdated
      );

      window.removeEventListener(
        'focus',
        onFocus
      );

      window.removeEventListener(
        'open-mobile-menu',
        onOpenMenu
      );

      window.removeEventListener(
        'open-mobile-search',
        onOpenSearch
      );
    };
  }, [query]);

  /* =======================================================
     SEARCH
     ======================================================= */

  useEffect(() => {
    if (!query.trim()) {
      setResults({
        products: [],
        categories: [],
        brands: [],
      });
      setSearchLoading(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      loadNavigation(query);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!query) {
      const interval = window.setInterval(() => {
        setPlaceholderIndex(
          (index) => (index + 1) % placeholderMessages.length
        );
      }, 2400);

      return () => window.clearInterval(interval);
    }

    return undefined;
  }, [query]);

  /* =======================================================
     PANEL BODY STATE
     ======================================================= */

  useEffect(() => {
    document.body.classList.toggle(
      'header-menu-open',
      menuOpen || searchOpen
    );

    if (searchOpen) {
      window.setTimeout(() => {
        searchRef.current?.focus();
      }, 0);
    }

    return () =>
      document.body.classList.remove(
        'header-menu-open'
      );
  }, [menuOpen, searchOpen]);

  /* =======================================================
     ESCAPE KEY
     ======================================================= */

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };

    const onPointerDown = (event) => {
      const clickedOutsideDesktop = desktopSearchRef.current && !desktopSearchRef.current.contains(event.target);
      const clickedOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(event.target);

      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setSearchOpen(false);
      }
    };

    window.addEventListener(
      'keydown',
      onKeyDown
    );
    document.addEventListener('mousedown', onPointerDown);

    return () => {
      window.removeEventListener(
        'keydown',
        onKeyDown
      );
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, []);

  /* =======================================================
     STICKY NAV
     ======================================================= */

  useEffect(() => {
    const onScroll = () => {
      setNavStuck(window.scrollY > 2);
    };

    onScroll();

    window.addEventListener(
      'scroll',
      onScroll,
      { passive: true }
    );

    return () =>
      window.removeEventListener(
        'scroll',
        onScroll
      );
  }, []);

  /* =======================================================
     CLOSE PANELS
     ======================================================= */

  function closePanels() {
    setMenuOpen(false);
    setSearchOpen(false);
    setCategoryOpen(false);
  }

  /* =======================================================
     LOGOUT
     ======================================================= */

  async function logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });

    setUser(null);

    closePanels();

    router.refresh();
  }

  /* =======================================================
     DATA
     ======================================================= */

  const userName =
    user?.name?.trim() || 'Account';

  const categoryLinks =
    suggestions.categories || [];

  const searchResults =
    results.products.map((item) => ({
      ...item,
      href: `/product/${item.slug}`,
    }));

  const searchCategories =
    results.categories.map((item) => ({
      ...item,
      href: `/category/${item.slug}`,
    }));

  const searchBrands =
    results.brands.map((item) => ({
      ...item,
      href: `/shop?brand=${encodeURIComponent(
        item.slug
      )}`,
    }));

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="header">
        <div className="container header-row">

          {/* MOBILE MENU */}
          <button
            className="mobile-menu-button"
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-store-menu"
            onClick={() => setMenuOpen(true)}
          >
            <MobileMenuIcon />
          </button>

          {/* LOGO */}
          <Link
            className="logo"
            href="/"
            aria-label="Prenaxo home"
          >
            <img
              src="/uploads/prenaxo-logo.png"
              alt="Prenaxo"
            />
          </Link>

          {/* DESKTOP SEARCH */}
          <form
            ref={desktopSearchRef}
            className="search"
            action="/search"
            onSubmit={() => setSearchOpen(false)}
          >
            <div className="search-input-shell">
              <input
                ref={searchRef}
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchOpen(true)}
                aria-label="Search products, brands and categories"
                autoComplete="off"
              />

              <SearchPlaceholder queryValue={query} index={placeholderIndex} />

              {query.trim() && searchLoading ? (
                <span className="search-loading-badge" aria-live="polite">Searching...</span>
              ) : null}

              <button type="submit" aria-label="Submit search">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>

            {query.trim() ? (
              <div className="header-search-results">
                {searchLoading ? (
                  <div className="header-search-status">Searching products...</div>
                ) : (
                  <>
                    {searchResults.length ? (
                      <div className="header-result-group products-group">
                        <strong>Products</strong>
                        {searchResults.map((item) => (
                          <ProductSuggestion
                            key={item.id}
                            item={item}
                            onSelect={() => {
                              setSearchOpen(false);
                              setQuery('');
                              router.push(item.href);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="header-search-empty">No products found</div>
                    )}

                    <ResultGroup
                      title="Categories"
                      items={searchCategories}
                      onSelect={() => {
                        setQuery('');
                        setSearchOpen(false);
                      }}
                    />

                    <ResultGroup
                      title="Brands"
                      items={searchBrands}
                      onSelect={() => {
                        setQuery('');
                        setSearchOpen(false);
                      }}
                    />
                  </>
                )}
              </div>
            ) : null}
          </form>

          {/* =================================================
              HEADER ACTIONS
          ================================================== */}

          <div className="nav-actions">

            {/* TRACK ORDER */}
            <Link
              className="icon-link track-link"
              href="/track-order"
            >
              <span className="header-action-icon track-icon">
                <TrackOrderIcon />
              </span>

              <span className='track-title'>
                Track order
              </span>
            </Link>

            {/* ACCOUNT */}
            <Link
              className="icon-link account-link"
              href="/account"
              aria-label={
                user
                  ? `Account of ${userName}`
                  : 'Account'
              }
            >
              <span className="header-action-icon">
                {user?.image && !userImageFailed ? (
                  <img
                    src={user.image}
                    alt={userName}
                    className="header-profile-image"
                    onError={() => setUserImageFailed(true)}
                    width="25"
                    height="25"
                  />
                ) : (
                  <UserIcon />
                )}
              </span>

              <span className="account-text">
                {userLoading
                  ? 'Account'
                  : userName}
              </span>
            </Link>

            {/* WISHLIST */}
            <Link
              className="icon-link wishlist-link"
              href="/wishlist"
            >
              <span className="header-action-icon">
                <WishlistIcon />
              </span>

              <span className="account-text">
                Wishlist
              </span>

              <i className="count wishlist-count">
                {wishlistCount > 99
                  ? '99+'
                  : wishlistCount}
              </i>
            </Link>

            {/* CART */}
            <button
              className="icon-link cart-trigger"
              type="button"
              onClick={() =>
                cart?.open()
              }
            >
              <span className="header-action-icon">
                <CartIcon />
              </span>

              <span className="account-text">
                Bag
              </span>

              <i className="count">
                {cart?.count || 0}
              </i>
            </button>

          </div>
        </div>
      </header>

      {/* =====================================================
          DESKTOP NAVIGATION
      ====================================================== */}

      <nav
        className={`nav ${
          navStuck ? 'is-stuck' : ''
        }`}
        aria-label="Main navigation"
      >
        <div className="container nav-inner">

          <Link
            className={
              pathname === '/'
                ? 'active'
                : ''
            }
            href="/"
          >
            Home
          </Link>

          <Link
            className={
              pathname === '/shop'
                ? 'active'
                : ''
            }
            href="/shop"
          >
            Shop all
          </Link>

          <Link
            className={
              pathname === '/combos'
                ? 'active'
                : ''
            }
            href="/combos"
          >
            Combos
          </Link>

          <Link
            className={`nav-offer ${
              pathname === '/flash-sale'
                ? 'active'
                : ''
            }`}
            href="/flash-sale"
          >
            Flash sale
          </Link>

          <Link
            className={
              pathname === '/about'
                ? 'active'
                : ''
            }
            href="/about"
          >
            About
          </Link>

          <Link
            className={
              pathname === '/contact'
                ? 'active'
                : ''
            }
            href="/contact"
          >
            Contact
          </Link>

        </div>
      </nav>

      {/* =====================================================
          MOBILE SEARCH PANEL
      ====================================================== */}

      <div
        ref={mobileSearchRef}
        className={`mobile-search-panel ${
          searchOpen ? 'is-open' : ''
        }`}
        role="dialog"
        aria-label="Mobile search"
        aria-hidden={!searchOpen}
      >
        <div className="mobile-search-inner">

          <form
            className="mobile-search-form"
            action="/search"
            onSubmit={() => setSearchOpen(false)}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />

            <div className="mobile-search-input-wrap">
              <input
                ref={searchOpen ? searchRef : undefined}
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search products"
                autoComplete="off"
              />

              <SearchPlaceholder queryValue={query} index={placeholderIndex} />
            </div>

            <button
              type="button"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </form>

          {query.trim() ? (
            <div className="header-search-results mobile-results">
              {searchLoading ? (
                <div className="header-search-status">Searching products...</div>
              ) : (
                <>
                  {searchResults.length ? (
                    <div className="header-result-group products-group">
                      <strong>Products</strong>
                      {searchResults.map((item) => (
                        <ProductSuggestion
                          key={item.id}
                          item={item}
                          onSelect={() => {
                            setSearchOpen(false);
                            setQuery('');
                            router.push(item.href);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="header-search-empty">No products found</div>
                  )}

                  <ResultGroup
                    title="Categories"
                    items={searchCategories}
                    onSelect={() => {
                      setSearchOpen(false);
                      setQuery('');
                    }}
                  />

                  <ResultGroup
                    title="Brands"
                    items={searchBrands}
                    onSelect={() => {
                      setSearchOpen(false);
                      setQuery('');
                    }}
                  />
                </>
              )}
            </div>
          ) : null}

        </div>
      </div>

      {/* =====================================================
          MOBILE MENU OVERLAY
      ====================================================== */}

      <div
        className={`mobile-menu-overlay ${
          menuOpen ? 'is-open' : ''
        }`}
        onClick={closePanels}
        role="presentation"
      />

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <aside
        id="mobile-store-menu"
        className={`mobile-store-menu ${
          menuOpen ? 'is-open' : ''
        }`}
        aria-hidden={!menuOpen}
        aria-label="Store menu"
      >
        {/* MOBILE MENU HEADER */}
        <div className="mobile-menu-head">

          <Link
            href="/"
            onClick={closePanels}
          >
            <img
              src="/uploads/prenaxo-logo.png"
              alt="Prenaxo"
            />
          </Link>

          <button
            type="button"
            aria-label="Close menu"
            onClick={closePanels}
          >
            <FontAwesomeIcon
              icon={faXmark}
            />
          </button>

        </div>

        <div className="mobile-menu-scroll">

          {/* =================================================
              MOBILE ACCOUNT
          ================================================== */}

          <div className="mobile-menu-account">

            {user ? (
              <>
                <span className="mobile-avatar">
                  {user.image && !userImageFailed ? (
                    <img
                      src={user.image}
                      alt={userName}
                      onError={() => setUserImageFailed(true)}
                      width="36"
                      height="36"
                    />
                  ) : (
                    <UserIcon />
                  )}
                </span>

                <div>
                  <strong>
                    {userName}
                  </strong>

                  <Link
                    href="/account"
                    onClick={closePanels}
                  >
                    My account
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  aria-label="Log out"
                >
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                  />
                </button>
              </>
            ) : (
              <>
                <span className="mobile-avatar">
                  <UserIcon />
                </span>

                <div>
                  <strong>
                    Welcome to Prenaxo
                  </strong>

                  <span>
                    Sign in to manage your account
                  </span>
                </div>

                <Link
                  className="mobile-login-link"
                  href="/login"
                  onClick={closePanels}
                >
                  Login
                </Link>
              </>
            )}

          </div>

          {/* =================================================
              SHOP
          ================================================== */}

          <div className="mobile-menu-section">

            <span className="mobile-menu-label">
              Shop
            </span>

            <Link
              href="/"
              onClick={closePanels}
            >
              Home
            </Link>

            <Link
              href="/shop"
              onClick={closePanels}
            >
              Shop all
            </Link>

            <button
              type="button"
              className="mobile-accordion"
              aria-expanded={categoryOpen}
              onClick={() =>
                setCategoryOpen(
                  (value) => !value
                )
              }
            >
              Categories

              <FontAwesomeIcon
                icon={faChevronDown}
              />
            </button>

            {categoryOpen && (
              <div className="mobile-sub-links">
                {categoryLinks.map(
                  (category) => (
                    <Link
                      href={`/category/${category.slug}`}
                      key={category.id}
                      onClick={closePanels}
                    >
                      {category.name}
                    </Link>
                  )
                )}
              </div>
            )}

            <Link
              href="/combos"
              onClick={closePanels}
            >
              Combos
            </Link>

            <Link
              href="/flash-sale"
              onClick={closePanels}
            >
              Flash sale
            </Link>

          </div>

          {/* =================================================
              ACCOUNT & HELP
          ================================================== */}

          <div className="mobile-menu-section">

            <span className="mobile-menu-label">
              Account & help
            </span>

            <Link
              href="/account/orders"
              onClick={closePanels}
            >
              My orders
            </Link>

            <Link
              href="/wishlist"
              onClick={closePanels}
            >
              Wishlist{' '}
              {wishlistCount > 0
                ? `(${wishlistCount})`
                : ''}
            </Link>

            <Link
              href="/track-order"
              onClick={closePanels}
            >
              Track order
            </Link>

            <Link
              href="/contact"
              onClick={closePanels}
            >
              Contact
            </Link>

            <Link
              href="/faq"
              onClick={closePanels}
            >
              FAQ
            </Link>

          </div>

          {/* =================================================
              ABOUT
          ================================================== */}

          <div className="mobile-menu-section">

            <span className="mobile-menu-label">
              About Prenaxo
            </span>

            <Link
              href="/about"
              onClick={closePanels}
            >
              About us
            </Link>

            <Link
              href="/privacy"
              onClick={closePanels}
            >
              Privacy policy
            </Link>

            <Link
              href="/terms"
              onClick={closePanels}
            >
              Terms & conditions
            </Link>

          </div>

        </div>
      </aside>
    </>
  );
}