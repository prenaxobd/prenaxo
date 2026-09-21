import AuthPage from '@/components/auth/AuthPage';

export const metadata = {
	title: 'Register',
	robots: { index: false, follow: true },
};

export default function RegisterPage() {
	return <AuthPage mode="register" />;
}
