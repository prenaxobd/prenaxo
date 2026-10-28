import { getProducts } from '@/lib/products';
import ComboProductsPage from '@/components/combos/ComboProductsPage';
import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const products = await getProducts();
  const hasCombos = products.some((product) => product.productType === 'COMBO');

  return getPageMetadata({
    title: 'Product Combos',
    description:
      'Browse product combos currently available from Prenaxo and review the products, prices and availability in each bundle.',
    path: '/combos',
    robots: hasCombos ? undefined : { index: false, follow: true },
  });
}

export default async function Combos() {
	const products = await getProducts();

	return <ComboProductsPage products={products.filter((product) => product.productType === 'COMBO')} />;
}
