import '@/components/flash-sale/FlashSalePage.css';
import { getProducts } from '@/lib/products';
import FlashSalePage from '@/components/flash-sale/FlashSalePage';
import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const products = await getProducts();
  const hasSaleProducts = products.some(
    (product) =>
      product.salePrice &&
      product.regularPrice &&
      product.salePrice < product.regularPrice
  );

  return getPageMetadata({
    title: 'Current Product Offers',
    description:
      'Browse products currently listed with sale pricing at Prenaxo. Check each product page for its latest price and availability.',
    path: '/flash-sale',
    robots: hasSaleProducts ? undefined : { index: false, follow: true },
  });
}

export default async function FlashSale() {
	const products = (await getProducts()).filter(product => product.salePrice && product.salePrice < product.regularPrice);
	return <FlashSalePage products={products} />;
}
