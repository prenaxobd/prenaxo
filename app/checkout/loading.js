export default function CheckoutLoading() {
  return (
    <main className="container checkout-page" aria-busy="true">
      <div className="checkout-loading">
        <span className="checkout-spinner" aria-hidden="true" />
        <div>
          <h1>Preparing checkout</h1>
          <p className="muted">Loading your order...</p>
        </div>
      </div>
    </main>
  );
}
