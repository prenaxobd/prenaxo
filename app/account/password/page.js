import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ChangePasswordForm from '@/components/account/ChangePasswordForm';

export default async function PasswordPage() {

  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/account/password');
  }

  return (
    <main className="account-page">
      <div className="account-container">

        <ChangePasswordForm />

      </div>
    </main>
  );
}