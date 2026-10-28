import CheckoutView from '@/components/checkout/CheckoutView';
import { getPageMetadata } from '@/lib/seo';

export const metadata = getPageMetadata({
	title: 'Checkout',
	description: 'Complete your Prenaxo order securely.',
	path: '/checkout',
	robots: { index: false, follow: true },
});

export default function Checkout(){return <CheckoutView/>}
