import Link from 'next/link';
import './product-page.css';

export default function ProductNotFound() {
  return (
    <main className="single-product-page">
      <div className="container">
        <div className="product-not-found">
          <div className="product-not-found-inner">
            <div className="not-found-icon" aria-hidden="true">📦</div>
            <h1>Product not found</h1>
            <p>Sorry, we could not find the product you are looking for.</p>
            <Link href="/shop" className="product-back-shop">
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
