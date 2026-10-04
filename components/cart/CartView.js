'use client';

import OptimizedImage from '@/components/OptimizedImage';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';

export default function CartView() {
  const cart = useCart();
  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const shipping = subtotal >= 3000 ? 0 : subtotal ? 80 : 0;
  const total = subtotal + shipping;

  if (!items.length) {
    return (
      <main className="container cart-page">
        <div className="cart-heading">
          <p>Shopping bag</p>
          <h1>Your cart</h1>
        </div>
        <div className="cart-empty">
          <span className="cart-empty-icon"><ShoppingBag size={30}/></span>
          <h2>Your cart is empty</h2>
          <p>Discover practical, quality products for your everyday.</p>
          <Link className="btn" href="/shop">Continue shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container cart-page">
      <div className="cart-heading">
        <p>Shopping bag</p>
        <div className="cart-heading-row">
          <h1>Your cart</h1>
          <span className="cart-item-count">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
        </div>
      </div>

      <div className="cart-layout">
        <section className="cart-items" aria-label="Cart items">
          <div className="cart-table-head">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>

          {items.map((item) => {
            const price = Number(item.variant?.price ?? item.product?.salePrice ?? item.product?.regularPrice ?? 0);
            const regular = Number(item.product?.regularPrice || 0);
            const selectedOptions = item.variant
              ? [item.variant.color, item.variant.size].filter(Boolean).join(' / ')
              : item.product?.attributeValues
                  ?.filter((attributeValue) => (item.attributeValueIds || []).includes(attributeValue.attributeValueId))
                  .map((attributeValue) => attributeValue.attributeValue?.name)
                  .filter(Boolean)
                  .join(' / ');

            return (
              <article className="cart-row" key={item.id}>
                <div className="cart-product">
                  <Link className="cart-product-image" href={`/product/${item.product?.slug}`} aria-label={item.product?.name || 'View product'}>
                    {item.product?.images?.[0]?.url
                      ? <OptimizedImage src={item.product.images[0].url} alt={item.product.name || ''}/>
                      : <ShoppingBag size={24}/>}
                  </Link>
                  <div className="cart-product-info">
                    <Link href={`/product/${item.product?.slug}`}>
                      <strong>{item.product?.name || 'Product'}</strong>
                    </Link>
                    {selectedOptions && <small className="cart-product-options">{selectedOptions}</small>}
                    {regular > price && <small className="cart-savings">You save ৳{(regular - price).toLocaleString()}</small>}
                  </div>
                </div>

                <div className="cart-row-details">
                  <div className="cart-price">
                    <span className="cart-mobile-label">Unit price</span>
                    <strong>৳{price.toLocaleString()}</strong>
                    {regular > price && <del>৳{regular.toLocaleString()}</del>}
                  </div>
                  <div className="cart-quantity-cell">
                    <span className="cart-mobile-label">Quantity</span>
                    <div className="cart-quantity">
                      <button
                        aria-label={`Decrease ${item.product?.name || 'product'} quantity`}
                        disabled={item.quantity <= 1}
                        onClick={() => cart.update(item.productId, item.quantity - 1, item.variantId, item.attributeValueIds)}
                      ><Minus size={14}/></button>
                      <span>{item.quantity}</span>
                      <button
                        aria-label={`Increase ${item.product?.name || 'product'} quantity`}
                        onClick={() => cart.update(item.productId, item.quantity + 1, item.variantId, item.attributeValueIds)}
                      ><Plus size={14}/></button>
                    </div>
                  </div>
                  <div className="cart-total">
                    <span className="cart-mobile-label">Item total</span>
                    <strong>৳{(price * item.quantity).toLocaleString()}</strong>
                    <button
                      className="cart-remove"
                      aria-label={`Remove ${item.product?.name || 'product'} from cart`}
                      onClick={() => cart.remove(item.productId, item.variantId, item.attributeValueIds)}
                    ><Trash2 size={16}/></button>
                  </div>
                </div>
              </article>
            );
          })}

          <Link href="/shop" className="continue-shopping"><ArrowLeft size={16}/> Continue shopping</Link>
        </section>

        <CartSummary subtotal={subtotal} shipping={shipping} total={total}/>
      </div>
    </main>
  );
}

function CartSummary({ subtotal, shipping, total }) {
  return (
    <aside className="cart-summary">
      <h2>Order summary</h2>
      <details>
        <summary>Have a coupon?</summary>
        <div className="coupon-row">
          <input placeholder="Coupon code"/>
          <button type="button">Apply</button>
        </div>
      </details>
      <div className="summary-line"><span>Subtotal</span><strong>৳{subtotal.toLocaleString()}</strong></div>
      <div className="summary-line"><span>Shipping</span><strong>{shipping ? `৳${shipping.toLocaleString()}` : 'Free'}</strong></div>
      <div className="summary-total"><span>Estimated total</span><strong>৳{total.toLocaleString()}</strong></div>
      <Link href="/checkout" className="btn cart-checkout">Proceed to checkout</Link>
      <div className="cart-summary-note">
        <span><Truck size={15}/> Shipping calculated at checkout</span>
        <span><ShieldCheck size={15}/> Secure checkout</span>
      </div>
    </aside>
  );
}
