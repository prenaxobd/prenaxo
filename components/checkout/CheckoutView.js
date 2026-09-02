'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const paymentOptions = [
  {
    id: 'COD',
    title: 'Cash on Delivery',
    short: 'COD',
    detail: 'Pay for your order when it is delivered to your address.',
  },
  {
    id: 'MOBILE',
    title: 'bKash / Nagad',
    short: 'Mobile Banking',
    detail: 'Send payment to 01608069154, then enter your transaction ID below.',
  },
  {
    id: 'BANK',
    title: 'Bank Payment',
    short: 'Bank',
    detail:
      'Our team will contact you with bank payment details after placing your order.',
  },
];

export default function CheckoutView() {
  const [cart, setCart] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    address: '',
    city: '',
    area: '',
    notes: '',
    paymentMethod: 'COD',
  });

  useEffect(() => {
    Promise.all([fetch('/api/cart'), fetch('/api/delivery')])
      .then(async ([cartResponse, deliveryResponse]) => {
        const cartData = await cartResponse.json();
        const deliveryData = await deliveryResponse.json();

        if (!cartResponse.ok) {
          throw new Error(cartData.error);
        }

        if (!deliveryResponse.ok) {
          throw new Error(deliveryData.error || 'Unable to load delivery options.');
        }

        setCart(cartData);
        setDelivery(deliveryData);
        const firstZone = deliveryData.zones[0];
        if (firstZone) {
          setForm((current) => ({
            ...current,
            city: firstZone.division,
            area: firstZone.district,
          }));
        }
      })
      .catch((err) => {
        setError(err.message || 'Unable to load your cart.');
      });
  }, []);

  const items = cart?.items || [];
  const zones = delivery?.zones || [];
  const selectedZone = zones.find(
    (zone) => zone.division === form.city && zone.district === form.area
  );

  const subtotal = items.reduce((sum, item) => {
    const price = Number(
      item.product.salePrice || item.product.regularPrice
    );

    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal >= (delivery?.threshold ?? 2000)
    ? 0
    : Number(selectedZone?.charge || 0);

  const total = subtotal + shipping;

  function update(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          ...form,

          shippingAddress: {
            address: form.address,
            city: form.city,
            district: form.area,
            notes: form.notes,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to place order.'
        );
      }

      window.location.assign(
        `/order-success?order=${data.orderNumber}`
      );
    } catch (err) {
      setError(
        err.message || 'Unable to place order.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (!cart && error) {
    return (
      <main className="container checkout-page">
        <div className="checkout-empty">
          <h1>Sign in to continue</h1>
          <p>{error}</p>
          <Link href="/login?next=/checkout" className="btn">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  if (!cart) {
    return (
      <main className="container checkout-page">
        <div className="checkout-loading">
          <span className="checkout-spinner" />
          <div>
            <h1>Preparing checkout</h1>
            <p className="muted">
              {error || 'Loading your order…'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="container checkout-page">
        <div className="checkout-empty">
          <span className="checkout-empty-icon">🛒</span>

          <h1>Your cart is empty</h1>

          <p>
            Add some products to your cart before proceeding
            to checkout.
          </p>

          <Link href="/shop" className="btn">
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container checkout-page">

      <div className="checkout-title">
        <div>
          <span className="checkout-eyebrow">
            Secure checkout
          </span>

          <h1>Checkout</h1>

          <p>
            Complete your details to place your order.
          </p>
        </div>

        <Link
          href="/cart"
          className="checkout-back"
        >
          ← Back to cart
        </Link>
      </div>

      <div className="checkout-layout">

        <form
          className="checkout-form"
          onSubmit={submit}
        >

          {/* CONTACT INFORMATION */}

          <section className="checkout-section">

            <div className="section-heading">
              <span className="section-number">01</span>

              <div>
                <h2>Contact information</h2>

                <p>
                  We will use this information for your order.
                </p>
              </div>
            </div>

            <label className="checkout-field">
              <span>Email address</span>

              <input
                required
                type="email"
                placeholder="you@example.com"
                value={form.customerEmail}
                onChange={(e) =>
                  update(
                    'customerEmail',
                    e.target.value
                  )
                }
              />
            </label>

          </section>

          {/* SHIPPING ADDRESS */}

          <section className="checkout-section">

            <div className="section-heading">
              <span className="section-number">02</span>

              <div>
                <h2>Shipping address</h2>

                <p>
                  Enter the address where you want your order delivered.
                </p>
              </div>
            </div>

            <div className="checkout-grid">

              <label className="checkout-field">
                <span>Full name</span>

                <input
                  required
                  placeholder="Enter your full name"
                  value={form.customerName}
                  onChange={(e) =>
                    update(
                      'customerName',
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="checkout-field">
                <span>Phone number</span>

                <input
                  required
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={form.customerPhone}
                  onChange={(e) =>
                    update(
                      'customerPhone',
                      e.target.value
                    )
                  }
                />
              </label>

            </div>

            <label className="checkout-field">
              <span>Full address</span>

              <input
                required
                placeholder="House, road, village or area"
                value={form.address}
                onChange={(e) =>
                  update(
                    'address',
                    e.target.value
                  )
                }
              />
            </label>

            <div className="checkout-grid">

              <label className="checkout-field">
                <span>Division</span>

                <select
                  value={form.city}
                  onChange={(e) => {
                    const division = e.target.value;
                    const firstDistrict = zones.find(
                      (zone) => zone.division === division
                    )?.district || '';
                    setForm((current) => ({
                      ...current,
                      city: division,
                      area: firstDistrict,
                    }));
                  }}
                >
                  {Array.from(new Set(zones.map((zone) => zone.division))).map((division) => (
                    <option key={division}>{division}</option>
                  ))}
                </select>
              </label>

              <label className="checkout-field">
                <span>City / Area</span>

                <select
                  required
                  value={form.area}
                  onChange={(e) =>
                    update(
                      'area',
                      e.target.value
                    )
                  }
                >
                  {zones
                    .filter((zone) => zone.division === form.city)
                    .map((zone) => (
                      <option key={zone.district}>{zone.district}</option>
                    ))}
                </select>
              </label>

            </div>

          </section>

          {/* SHIPPING */}

          <section className="checkout-section">

            <div className="section-heading">
              <span className="section-number">03</span>

              <div>
                <h2>Shipping option</h2>

                <p>
                  Delivery cost is calculated based on your location.
                </p>
              </div>
            </div>

            <label className="shipping-option selected">

              <span className="shipping-radio">
                <input
                  type="radio"
                  checked
                  readOnly
                />

                <span />
              </span>

              <span className="shipping-info">
                <strong>Standard delivery</strong>

                <small>
                  {selectedZone?.district || 'Select a delivery area'}
                </small>
              </span>

              <strong className="shipping-price">
                {shipping
                  ? `৳${shipping.toLocaleString()}`
                  : 'Free'}
              </strong>

            </label>

            <p className="shipping-note">
              Free delivery on orders over ৳{Number(delivery?.threshold ?? 2000).toLocaleString()}.
            </p>

          </section>

          {/* PAYMENT */}

          <section className="checkout-section">

            <div className="section-heading">
              <span className="section-number">04</span>

              <div>
                <h2>Payment options</h2>

                <p>
                  Select your preferred payment method.
                </p>
              </div>
            </div>

            <div className="payment-options">

              {paymentOptions.map((option) => {

                const selected =
                  form.paymentMethod === option.id;

                return (
                  <label
                    key={option.id}
                    className={`payment-option ${
                      selected ? 'selected' : ''
                    }`}
                  >

                    <div className="payment-option-head">

                      <span className="payment-radio">
                        <input
                          type="radio"
                          name="payment"
                          checked={selected}
                          onChange={() =>
                            update(
                              'paymentMethod',
                              option.id
                            )
                          }
                        />

                        <span />
                      </span>

                      <span className="payment-name">

                        <strong>
                          {option.title}
                        </strong>

                        <small>
                          {option.short}
                        </small>

                      </span>

                    </div>

                    {selected && (
                      <div className="payment-details">

                        <p>
                          {option.detail}
                        </p>

                        {option.id === 'MOBILE' && (
                          <div className="mobile-payment-box">

                            <div>
                              <span>
                                Send money to
                              </span>

                              <strong>
                                01608069154
                              </strong>
                            </div>

                            <label className="checkout-field">

                              <span>
                                Transaction ID
                              </span>

                              <input
                                placeholder="Enter transaction ID in order note below"
                                value={form.notes}
                                onChange={(e) =>
                                  update(
                                    'notes',
                                    e.target.value
                                  )
                                }
                              />

                            </label>

                          </div>
                        )}

                      </div>
                    )}

                  </label>
                );
              })}

            </div>

          </section>

          {/* ORDER NOTE */}

          <section className="checkout-section checkout-note-section">

            <div className="section-heading">
              <span className="section-number">05</span>

              <div>
                <h2>Additional information</h2>

                <p>
                  Add delivery instructions or an order note.
                </p>
              </div>
            </div>

            <label className="checkout-field">

              <span>
                Order note
                <em>Optional</em>
              </span>

              <textarea
                rows="4"
                placeholder="Special delivery instructions..."
                value={form.notes}
                onChange={(e) =>
                  update(
                    'notes',
                    e.target.value
                  )
                }
              />

            </label>

          </section>

          {error && (
            <div
              className="checkout-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="checkout-submit-area">

            <p className="checkout-terms">
              By placing your order, you agree to our{' '}
              <Link href="/terms">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy">
                Privacy Policy
              </Link>
              .
            </p>

            <button
              className="btn place-order"
              disabled={loading}
            >
              {loading
                ? 'Placing your order…'
                : `Place order · ৳${total.toLocaleString()}`}
            </button>

          </div>

        </form>

        <OrderSummary
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
        />

      </div>

    </main>
  );
}

function OrderSummary({
  items,
  subtotal,
  shipping,
  total,
}) {
  return (
    <aside className="checkout-summary">

      <div className="checkout-summary-head">

        <div>
          <span className="summary-label">
            Your order
          </span>

          <h2>Order summary</h2>
        </div>

        <span className="summary-count">
          {items.reduce(
            (sum, item) =>
              sum + item.quantity,
            0
          )}{' '}
          items
        </span>

      </div>

      <div className="checkout-products">

        {items.map((item) => {

          const price = Number(
            item.product.salePrice ||
            item.product.regularPrice
          );

          const itemTotal =
            price * item.quantity;

          return (
            <div
              className="checkout-product"
              key={item.id}
            >

              <div className="checkout-thumb">

                {item.product.images?.[0]?.url ? (
                  <img
                    src={
                      item.product.images[0].url
                    }
                    alt={item.product.name}
                  />
                ) : (
                  <div className="no-product-image">
                    No image
                  </div>
                )}

                <b>{item.quantity}</b>

              </div>

              <div className="checkout-product-info">

                <strong>
                  {item.product.name}
                </strong>

                <span>
                  ৳{price.toLocaleString()} each
                </span>

              </div>

              <strong className="checkout-product-total">
                ৳{itemTotal.toLocaleString()}
              </strong>

            </div>
          );
        })}

      </div>

      <div className="coupon-box">

        <span className="coupon-title">
          Have a coupon?
        </span>

        <div className="coupon-row">

          <input
            placeholder="Enter coupon code"
          />

          <button type="button">
            Apply
          </button>

        </div>

      </div>

      <div className="summary-calculation">

        <div className="summary-line">
          <span>Subtotal</span>

          <strong>
            ৳{subtotal.toLocaleString()}
          </strong>
        </div>

        <div className="summary-line">
          <span>Shipping</span>

          <strong>
            {shipping
              ? `৳${shipping.toLocaleString()}`
              : 'Free'}
          </strong>
        </div>

      </div>

      <div className="summary-total">

        <div>
          <span>Total</span>

          <small>
            Including applicable delivery charge
          </small>
        </div>

        <strong>
          ৳{total.toLocaleString()}
        </strong>

      </div>

      <Link
        href="/cart"
        className="summary-edit"
      >
        ← Edit cart
      </Link>

    </aside>
  );
}