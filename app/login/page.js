import AuthPage from '@/components/auth/AuthPage';
import { getPageMetadata } from '@/lib/seo';

export const metadata = getPageMetadata({
  title: 'Login',
  description: 'Sign in to your Prenaxo account.',
  path: '/login',
  robots: { index: false, follow: true },
});

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
