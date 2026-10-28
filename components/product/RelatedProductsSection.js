import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getRelatedProducts } from '@/lib/products';
import RelatedProducts from '@/components/product/RelatedProducts';

export default async function RelatedProductsSection({ productId, categoryId }) {
  const products = await getRelatedProducts(productId, categoryId);
  if (!products.length) return null;

  return (
    <section className="container related-products">
      <div className="section-heading">
        <div>
          <span>YOU MAY ALSO LIKE</span>
          <h2>Related Products</h2>
        </div>
        <Link href="/shop" className="related-view-all">
          View all
          <ChevronRight size={16} />
        </Link>
      </div>
      <RelatedProducts products={products} />
    </section>
  );
}
