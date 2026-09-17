'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

export default function LogoutButton() {
  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      window.location.href = '/login';
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="account-logout"
    >
      <span><FontAwesomeIcon icon={faRightFromBracket} aria-hidden="true" /></span>
      Logout
    </button>
  );
}