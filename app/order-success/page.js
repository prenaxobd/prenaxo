import OrderSuccessView from './OrderSuccessView';

export const metadata = {
	title: 'Order Confirmation',
	robots: { index: false, follow: true },
};

export default async function OrderSuccess({ searchParams }) {
	const { order: orderNumber } = await searchParams;
	return <OrderSuccessView orderNumber={orderNumber || ''} />;
}
