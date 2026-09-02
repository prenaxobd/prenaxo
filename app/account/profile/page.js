import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ProfileForm from '@/components/account/ProfileForm';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/account/profile');
  }

  return (
    <main className="profile-page">

      <div className="profile-page-container">

        {/* PAGE HEADER */}
        <div className="profile-page-header">

          <div className="profile-page-heading">

            <span className="profile-page-eyebrow">
              YOUR ACCOUNT
            </span>

            <h1>Profile Information</h1>

            <p>
              Manage your personal information and account details.
            </p>

          </div>

          <Link
            href="/account"
            className="profile-back-button"
          >
            <span>←</span>
            Back to Account
          </Link>

        </div>


        {/* PROFILE */}
        <ProfileForm user={user} />

      </div>

    </main>
  );
}