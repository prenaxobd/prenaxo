import Link from 'next/link';

export default function AccountHeader({ user }) {
  return (
    <section className="account-hero">
      <div className="container">
        <div className="account-breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <span>My Account</span>
        </div>

        <div className="account-hero-content">
          <div>
            <span className="account-eyebrow">YOUR SPACE</span>

            <h1>My Account</h1>

            <p>
              Manage your profile, orders, addresses and more —
              all in one place.
            </p>
          </div>

          <div className="account-hero-decoration">
            <span>🛍</span>
          </div>
        </div>
      </div>
    </section>
  );
}