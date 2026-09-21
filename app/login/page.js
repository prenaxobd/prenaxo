import AuthPage from '@/components/auth/AuthPage';

export const metadata = {
  title: 'Login',
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
