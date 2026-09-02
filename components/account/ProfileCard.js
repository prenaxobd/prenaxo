import Link from 'next/link';

export default function ProfileCard({ user }) {
  const image =
    user.image || '/images/default-avatar.png';

  return (
    <div className="account-profile-card">
      <div className="profile-avatar-wrap">
        <img
          src={image}
          alt={user.name}
          className="profile-avatar"
        />

        <Link
          href="/account/profile"
          className="profile-camera"
          title="Edit profile"
        >
          ✎
        </Link>
      </div>

      <div className="profile-card-info">
        <div className="profile-name-row">
          <h2>{user.name}</h2>

          <span className="verified-badge">
            ✓ Verified Account
          </span>
        </div>

        <div className="profile-contact">
          <span>✉ {user.email}</span>

          {user.phone && (
            <span>☎ {user.phone}</span>
          )}

          {user.address?.city && (
            <span>
              ⌖ {user.address.city}
              {user.address.country
                ? `, ${user.address.country}`
                : ''}
            </span>
          )}
        </div>

        <div className="profile-message">
          Good things take time, keep going.
        </div>
      </div>

      <Link
        href="/account/profile"
        className="account-edit-btn"
      >
        ✎ Edit Profile
      </Link>
    </div>
  );
}