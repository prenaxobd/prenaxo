'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      window.dispatchEvent(new Event('auth-state-changed'));
      router.push('/login');
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