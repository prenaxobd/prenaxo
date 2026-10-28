import { getRelatedProducts } from '@/lib/products';
import RelatedProducts from '@/components/product/RelatedProducts';

export default async function RelatedProductsSection({ productId, categoryId }) {
  const products = await getRelatedProducts(productId, categoryId);
  return <RelatedProducts products={products} />;
}
