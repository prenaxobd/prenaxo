import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AccountSidebar from '@/components/account/AccountSidebar';

export default async function AddressesPage() {

  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/account/addresses');
  }

  const address =
    user.address && typeof user.address === 'object'
      ? user.address
      : {};

  return (
    <main className="account-page">

      <div className="account-container">

        <AccountSidebar user={user} />

        <section className="account-main">

          <div className="account-page-header">

            <div>
              <span className="account-eyebrow">
                DELIVERY
              </span>

              <h1>My Addresses</h1>

              <p>
                Manage your shipping and delivery address.
              </p>
            </div>

            <Link
              href="/account"
              className="account-back-btn"
            >
              ← Account
            </Link>

          </div>

          <div className="account-card address-card">

            <div className="address-card-header">
              <div>
                <h2>Default Address</h2>
                <p>Your current delivery address</p>
              </div>

              <span className="address-badge">
                Default
              </span>
            </div>

            {address?.address ? (

              <div className="saved-address">

                <strong>
                  {user.name}
                </strong>

                <span>
                  {user.phone}
                </span>

                <p>
                  {address.address}
                </p>

                <span>
                  {address.area || ''}
                  {address.area && address.city ? ', ' : ''}
                  {address.city || ''}
                </span>

              </div>

            ) : (

              <div className="account-empty address-empty">
                <div>⌖</div>

                <h3>No address saved</h3>

                <p>
                  Add your delivery address below.
                </p>
              </div>

            )}

            <form
              action="/api/account/addresses"
              method="POST"
              className="address-form"
            >

              <div className="form-grid">

                <div className="form-field">
                  <label>Address</label>

                  <textarea
                    name="address"
                    defaultValue={address.address || ''}
                    placeholder="House, road, area..."
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Area</label>

                  <input
                    name="area"
                    defaultValue={address.area || ''}
                    placeholder="Area"
                  />
                </div>

                <div className="form-field">
                  <label>City</label>

                  <input
                    name="city"
                    defaultValue={address.city || 'Dhaka'}
                    placeholder="City"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>District</label>

                  <input
                    name="district"
                    defaultValue={address.district || ''}
                    placeholder="District"
                  />
                </div>

              </div>

              <button
                type="submit"
                className="account-primary-btn"
              >
                Save Address
              </button>

            </form>

          </div>

        </section>

      </div>

    </main>
  );
}