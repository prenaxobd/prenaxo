import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function AccountSidebar({ user }) {
  return (
    <aside className="account-sidebar">

      <nav className="account-navigation">

        <Link
          href="/account"
          className="account-nav-item active"
        >
          <span>⌂</span>
          Dashboard
        </Link>

        <Link
          href="/account/profile"
          className="account-nav-item"
        >
          <span>◉</span>
          Profile Information
        </Link>

        <Link
          href="/account/orders"
          className="account-nav-item"
        >
          <span>▣</span>
          My Orders
        </Link>

        <Link
          href="/wishlist"
          className="account-nav-item"
        >
          <span>♡</span>
          Wishlist
        </Link>

        <Link
          href="/account/addresses"
          className="account-nav-item"
        >
          <span>⌖</span>
          Addresses
        </Link>

        <Link
          href="/account/password"
          className="account-nav-item"
        >
          <span>▣</span>
          Change Password
        </Link>

        <Link
          href="/account/reviews"
          className="account-nav-item"
        >
          <span>☆</span>
          My Reviews
        </Link>

        <div className="account-nav-divider" />

        <LogoutButton />

      </nav>

      <div className="account-help-card">
        <div className="help-icon">?</div>

        <h3>Need Help?</h3>

        <p>
          We are here to help you with your shopping experience.
        </p>

        <Link href="/contact">
          Contact Support →
        </Link>
      </div>

    </aside>
  );
}