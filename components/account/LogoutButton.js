'use client';

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
      <span>→</span>
      Logout
    </button>
  );
}