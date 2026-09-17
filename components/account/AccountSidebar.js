import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxOpen,
  faHeart,
  faHouse,
  faLocationDot,
  faLock,
  faCircleQuestion,
  faStar,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import LogoutButton from './LogoutButton';

export default function AccountSidebar({ user }) {
  return (
    <aside className="account-sidebar">

      <nav className="account-navigation">

        <Link
          href="/account"
          className="account-nav-item active"
        >
          <span><FontAwesomeIcon icon={faHouse} aria-hidden="true" /></span>
          Dashboard
        </Link>

        <Link
          href="/account/profile"
          className="account-nav-item"
        >
          <span><FontAwesomeIcon icon={faUser} aria-hidden="true" /></span>
          Profile Information
        </Link>

        <Link
          href="/account/orders"
          className="account-nav-item"
        >
          <span><FontAwesomeIcon icon={faBoxOpen} aria-hidden="true" /></span>
          My Orders
        </Link>

        <Link
          href="/wishlist"
          className="account-nav-item"
        >
          <span><FontAwesomeIcon icon={faHeart} aria-hidden="true" /></span>
          Wishlist
        </Link>

        <Link
          href="/account/addresses"
          className="account-nav-item"
        >
          <span><FontAwesomeIcon icon={faLocationDot} aria-hidden="true" /></span>
          Addresses
        </Link>

        <Link
          href="/account/password"
          className="account-nav-item"
        >
          <span><FontAwesomeIcon icon={faLock} aria-hidden="true" /></span>
          Change Password
        </Link>

        <Link
          href="/account/reviews"
          className="account-nav-item"
        >
          <span><FontAwesomeIcon icon={faStar} aria-hidden="true" /></span>
          My Reviews
        </Link>

        <div className="account-nav-divider" />

        <LogoutButton />

      </nav>

      <div className="account-help-card">
        <div className="help-icon">
          <FontAwesomeIcon icon={faCircleQuestion} aria-hidden="true" />
        </div>

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