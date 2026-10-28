import OrderSuccessView from './OrderSuccessView';
import { getPageMetadata } from '@/lib/seo';

export const metadata = getPageMetadata({
	title: 'Order Confirmation',
	description: 'View confirmation details for your Prenaxo order.',
	path: '/order-success',
	robots: { index: false, follow: true },
});

export default async function OrderSuccess({ searchParams }) {
	const { order: orderNumber } = await searchParams;
	return <OrderSuccessView orderNumber={orderNumber || ''} />;
}
