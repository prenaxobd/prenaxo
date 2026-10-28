import AuthPage from '@/components/auth/AuthPage';
import { getPageMetadata } from '@/lib/seo';

export const metadata = getPageMetadata({
	title: 'Register',
	description: 'Create a Prenaxo account to manage orders and shopping preferences.',
	path: '/register',
	robots: { index: false, follow: true },
});

export default function RegisterPage() {
	return <AuthPage mode="register" />;
}
