'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCartShopping, faChevronDown, faHeart, faMagnifyingGlass, faMapPin, faRightFromBracket, faUser, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/components/cart/CartProvider';

const placeholderMessages = ['Search for products...', 'Search by category...', 'Search by brand...', 'Search for Honey...', 'Search for Dates...', 'Search for Rice...'];

function ResultGroup({ title, items, children }) {
  if (!items?.length) return null;
  return <div className="header-result-group"><strong>{title}</strong>{items.map((item) => <Link href={item.href} key={item.id} className="header-result" onClick={children}><span>{item.name}</span><FontAwesomeIcon icon={faChevronDown} /></Link>)}</div>;
}

export default function Header() {
  const router = useRouter();
  const cart = useCart();
  const searchRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], categories: [], brands: [] });
  const [suggestions, setSuggestions] = useState({ products: [], categories: [], brands: [] });
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [navStuck, setNavStuck] = useState(false);

  async function loadUser() {
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await response.json();
      setUser(data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  }

  async function loadWishlistCount() {
    try {
      const response = await fetch('/api/wishlist', { cache: 'no-store' });
      const data = await response.json();
      setWishlistCount(Array.isArray(data?.items) ? data.items.length : 0);
    } catch {
      setWishlistCount(0);
    }
  }

  async function loadNavigation(value = '') {
    try {
      const response = await fetch(`/api/navigation${value ? `?q=${encodeURIComponent(value)}` : ''}`, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (value) setResults(data);
      else setSuggestions(data);
    } catch {
      if (value) setResults({ products: [], categories: [], brands: [] });
    }
  }

  useEffect(() => {
    loadUser();
    loadWishlistCount();
    loadNavigation();
    const interval = window.setInterval(() => {
      if (!query) setPlaceholderIndex((index) => (index + 1) % placeholderMessages.length);
    }, 3200);
    const onWishlist = (event) => {
      if (typeof event?.detail?.count === 'number') setWishlistCount(event.detail.count);
      else loadWishlistCount();
    };
    const onUser = () => loadUser();
    const onFocus = () => { loadUser(); loadWishlistCount(); };
    const onOpenMenu = () => setMenuOpen(true);
    const onOpenSearch = () => { setSearchOpen(true); setMenuOpen(false); };
    window.addEventListener('wishlist-updated', onWishlist);
    window.addEventListener('user-updated', onUser);
    window.addEventListener('focus', onFocus);
    window.addEventListener('open-mobile-menu', onOpenMenu);
    window.addEventListener('open-mobile-search', onOpenSearch);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('wishlist-updated', onWishlist);
      window.removeEventListener('user-updated', onUser);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('open-mobile-menu', onOpenMenu);
      window.removeEventListener('open-mobile-search', onOpenSearch);
    };
  }, []);

  useEffect(() => {
    if (!query) {
      setResults({ products: [], categories: [], brands: [] });
      return undefined;
    }
    const timer = window.setTimeout(() => loadNavigation(query), 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    document.body.classList.toggle('header-menu-open', menuOpen || searchOpen);
    if (searchOpen) window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => document.body.classList.remove('header-menu-open');
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavStuck(window.scrollY > 2);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function closePanels() {
    setMenuOpen(false);
    setSearchOpen(false);
    setCategoryOpen(false);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    closePanels();
    router.refresh();
  }

  const userName = user?.name?.trim() || 'Account';
  const categoryLinks = suggestions.categories || [];
  const searchResults = results.products.map((item) => ({ ...item, href: `/product/${item.slug}` }));
  const searchCategories = results.categories.map((item) => ({ ...item, href: `/category/${item.slug}` }));
  const searchBrands = results.brands.map((item) => ({ ...item, href: `/shop?brand=${encodeURIComponent(item.slug)}` }));

  return <>
    <div className="announcement">Fast delivery across Bangladesh <span>•</span> Secure payment <span>•</span> Customer support</div>
    <header className="header">
      <div className="container header-row">
        <button className="mobile-menu-button" type="button" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="mobile-store-menu" onClick={() => setMenuOpen(true)}><FontAwesomeIcon icon={faBars} /></button>
        <Link className="logo" href="/" aria-label="Khatibazar home"><img src="/uploads/khatibazar_logo.png" alt="Khatibazar" /></Link>
        <form className="search" action="/search" onSubmit={() => setSearchOpen(false)}>
          <input ref={searchRef} name="q" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setSearchOpen(false)} placeholder={query ? 'Search products, brands and categories...' : placeholderMessages[placeholderIndex]} aria-label="Search products, brands and categories" autoComplete="off" />
          <button type="submit" aria-label="Submit search"><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
          {query && (results.products.length || results.categories.length || results.brands.length) ? <div className="header-search-results"><ResultGroup title="Products" items={searchResults} children={() => setQuery('')} /><ResultGroup title="Categories" items={searchCategories} children={() => setQuery('')} /><ResultGroup title="Brands" items={searchBrands} children={() => setQuery('')} /></div> : null}
        </form>
        <div className="nav-actions">
          <Link className="icon-link track-link" href="/track-order"><FontAwesomeIcon icon={faMapPin} /><span>Track order</span></Link>
          <Link className="icon-link account-link" href="/account" aria-label={user ? `Account of ${userName}` : 'Account'}><span className="header-action-icon">{user?.image ? <img src={user.image} alt={userName} className="header-profile-image" /> : <FontAwesomeIcon icon={faUser} />}</span><span className="account-text">{userLoading ? 'Account' : userName}</span></Link>
          <Link className="icon-link wishlist-link" href="/wishlist"><span className="header-action-icon"><FontAwesomeIcon icon={faHeart} /></span><span className="account-text">Wishlist</span><i className="count wishlist-count">{wishlistCount > 99 ? '99+' : wishlistCount}</i></Link>
          <button className="icon-link cart-trigger" type="button" onClick={() => cart?.open()}><span className="header-action-icon"><FontAwesomeIcon icon={faCartShopping} /></span><span className="account-text">Bag</span><i className="count">{cart?.count || 0}</i></button>
        </div>
      </div>
    </header>

    <nav className={`nav ${navStuck ? 'is-stuck' : ''}`} aria-label="Main navigation"><div className="container nav-inner"><Link href="/">Home</Link><Link href="/shop">Shop all</Link><Link href="/combos">Combos</Link><Link className="nav-offer" href="/flash-sale">Flash sale</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></div></nav>

    <div className={`mobile-search-panel ${searchOpen ? 'is-open' : ''}`} role="dialog" aria-label="Mobile search" aria-hidden={!searchOpen}><div className="mobile-search-inner"><form className="mobile-search-form" action="/search" onSubmit={() => setSearchOpen(false)}><FontAwesomeIcon icon={faMagnifyingGlass} /><input ref={searchOpen ? searchRef : undefined} name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands and categories..." aria-label="Search products" autoComplete="off" /><button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}><FontAwesomeIcon icon={faXmark} /></button></form>{query && (results.products.length || results.categories.length || results.brands.length) ? <div className="header-search-results mobile-results"><ResultGroup title="Products" items={searchResults} children={() => setSearchOpen(false)} /><ResultGroup title="Categories" items={searchCategories} children={() => setSearchOpen(false)} /><ResultGroup title="Brands" items={searchBrands} children={() => setSearchOpen(false)} /></div> : null}</div></div>

    <div className={`mobile-menu-overlay ${menuOpen ? 'is-open' : ''}`} onClick={closePanels} role="presentation" />
    <aside id="mobile-store-menu" className={`mobile-store-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen} aria-label="Store menu"><div className="mobile-menu-head"><Link href="/" onClick={closePanels}><img src="/uploads/khatibazar_logo.png" alt="Khatibazar" /></Link><button type="button" aria-label="Close menu" onClick={closePanels}><FontAwesomeIcon icon={faXmark} /></button></div><div className="mobile-menu-scroll"><div className="mobile-menu-account">{user ? <><span className="mobile-avatar">{user.image ? <img src={user.image} alt="" /> : userName.charAt(0).toUpperCase()}</span><div><strong>{userName}</strong><Link href="/account" onClick={closePanels}>My account</Link></div><button type="button" onClick={logout} aria-label="Log out"><FontAwesomeIcon icon={faRightFromBracket} /></button></> : <><span className="mobile-avatar"><FontAwesomeIcon icon={faUser} /></span><div><strong>Welcome to Khatibazar</strong><span>Sign in to manage your account</span></div><Link className="mobile-login-link" href="/login" onClick={closePanels}>Login</Link></>}</div><div className="mobile-menu-section"><span className="mobile-menu-label">Shop</span><Link href="/" onClick={closePanels}>Home</Link><Link href="/shop" onClick={closePanels}>Shop all</Link><button type="button" className="mobile-accordion" aria-expanded={categoryOpen} onClick={() => setCategoryOpen((value) => !value)}>Categories <FontAwesomeIcon icon={faChevronDown} /></button>{categoryOpen && <div className="mobile-sub-links">{categoryLinks.map((category) => <Link href={`/category/${category.slug}`} key={category.id} onClick={closePanels}>{category.name}</Link>)}</div>}<Link href="/combos" onClick={closePanels}>Combos</Link><Link href="/flash-sale" onClick={closePanels}>Flash sale</Link></div><div className="mobile-menu-section"><span className="mobile-menu-label">Account & help</span><Link href="/account/orders" onClick={closePanels}>My orders</Link><Link href="/wishlist" onClick={closePanels}>Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}</Link><Link href="/track-order" onClick={closePanels}>Track order</Link><Link href="/contact" onClick={closePanels}>Contact</Link><Link href="/faq" onClick={closePanels}>FAQ</Link></div><div className="mobile-menu-section"><span className="mobile-menu-label">About Khatibazar</span><Link href="/about" onClick={closePanels}>About us</Link><Link href="/privacy" onClick={closePanels}>Privacy policy</Link><Link href="/terms" onClick={closePanels}>Terms & conditions</Link></div></div></aside>
  </>;
}