import { getProducts } from '@/lib/products';
import FlashSalePage from '@/components/flash-sale/FlashSalePage';

export default async function FlashSale() {
	const products = (await getProducts()).filter(product => product.salePrice && product.salePrice < product.regularPrice);
	return <FlashSalePage products={products} />;
}
