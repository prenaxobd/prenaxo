'use client';

import Link from 'next/link';
import { startTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faChevronDown, faExpand, faMagnifyingGlass, faMessage, faMoon, faPlus, faSun } from '@fortawesome/free-solid-svg-icons';

export default function AdminHeader({ user }) {
  const router = useRouter();
  const [menu, setMenu] = useState(null);
  const [theme, setTheme] = useState('light');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('khatibazar-admin-theme') || 'light';
    startTransition(() => setTheme(saved));
    document.documentElement.dataset.adminTheme = saved;
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    window.localStorage.setItem('khatibazar-admin-theme', next);
    document.documentElement.dataset.adminTheme = next;
    setMenu(null);
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/admin/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return <header className="admin-topbar">
    <div className="admin-search-wrap"><FontAwesomeIcon icon={faMagnifyingGlass} className="admin-search-icon" /><input aria-label="Search admin" placeholder="Search anything..." /><span className="admin-shortcut">Ctrl + /</span></div>
    <div className="admin-topbar-actions">
      <div className="admin-header-menu-wrap"><button type="button" className="admin-primary-btn" onClick={() => setMenu(menu === 'create' ? null : 'create')}><FontAwesomeIcon icon={faPlus} /> Add New</button>{menu === 'create' && <div className="admin-popover admin-create-menu"><strong>Create new</strong><Link href="/admin/products/new" onClick={() => setMenu(null)}>Product</Link><Link href="/admin/categories" onClick={() => setMenu(null)}>Category</Link><Link href="/admin/brands" onClick={() => setMenu(null)}>Brand</Link><Link href="/admin/users/new" onClick={() => setMenu(null)}>Worker account</Link></div>}</div>
      <div className="admin-header-menu-wrap"><button type="button" className="admin-icon-btn" aria-label="Notifications" onClick={() => setMenu(menu === 'notifications' ? null : 'notifications')}><FontAwesomeIcon icon={faBell} /><span className="admin-notification-dot">3</span></button>{menu === 'notifications' && <div className="admin-popover admin-notification-menu"><strong>Notifications</strong><p>3 reviews are waiting for approval.</p><p>2 products are low in stock.</p><p>New order received today.</p></div>}</div>
      <div className="admin-header-menu-wrap"><button type="button" className="admin-icon-btn" aria-label="Messages" onClick={() => setMenu(menu === 'messages' ? null : 'messages')}><FontAwesomeIcon icon={faMessage} /></button>{menu === 'messages' && <div className="admin-popover admin-notification-menu"><strong>Messages</strong><p>No unread messages.</p></div>}</div>
      <button type="button" className="admin-icon-btn" aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'} onClick={toggleTheme}><FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} /></button>
      <button type="button" className="admin-icon-btn admin-expand-btn" aria-label="Toggle fullscreen" onClick={() => document.documentElement.requestFullscreen?.()}><FontAwesomeIcon icon={faExpand} /></button>
      <div className="admin-header-menu-wrap"><button type="button" className="admin-profile" aria-expanded={menu === 'profile'} onClick={() => setMenu(menu === 'profile' ? null : 'profile')}><div className="admin-profile-avatar">{user.name?.charAt(0).toUpperCase()}</div><div className="admin-profile-meta"><strong>{user.name}</strong><span>Super Admin</span></div><FontAwesomeIcon icon={faChevronDown} className="admin-profile-caret" /></button>{menu === 'profile' && <div className="admin-popover admin-profile-menu"><Link href="/account/profile" onClick={() => setMenu(null)}>Profile</Link><Link href="/admin/settings" onClick={() => setMenu(null)}>Settings</Link><Link href="/" target="_blank" onClick={() => setMenu(null)}>View store</Link><button type="button" onClick={logout} disabled={loggingOut}>{loggingOut ? 'Signing out...' : 'Logout'}</button></div>}</div>
    </div>
  </header>;
}
