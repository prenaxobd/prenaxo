import { getProducts } from '@/lib/products';
import ComboProductsPage from '@/components/combos/ComboProductsPage';

export default async function Combos() {
	const products = await getProducts();

	return <ComboProductsPage products={products.filter((product) => product.productType === 'COMBO')} />;
}
