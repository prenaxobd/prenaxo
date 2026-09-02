import { getProducts } from '@/lib/products';
import ShopBrowser from '@/components/shop/ShopBrowser';

export default async function Shop() {
	const products = await getProducts();
	return <ShopBrowser products={products} />;
}
