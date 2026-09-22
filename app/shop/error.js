'use client';

export default function ShopError({ reset }) {
  return (
    <main className="container shop-error-state">
      <h1>We could not load the shop</h1>
      <p>Please try again. Your products and account data are unchanged.</p>
      <button type="button" className="btn" onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}
