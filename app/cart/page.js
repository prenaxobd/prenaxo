import CartView from '@/components/cart/CartView';
import { getPageMetadata } from '@/lib/seo';

export const metadata = getPageMetadata({
	title: 'Cart',
	description: 'Review items in your Prenaxo shopping cart.',
	path: '/cart',
	robots: { index: false, follow: true },
});

export default function Cart(){return <CartView/>}
