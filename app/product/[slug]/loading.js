export default function Loading() {
  return (
    <main className="single-product-page product-loading" aria-busy="true">
      <div className="container">
        <div className="product-loading-breadcrumb" aria-hidden="true">
          <span className="product-skeleton product-skeleton-short" />
          <span className="product-skeleton product-skeleton-crumb" />
          <span className="product-skeleton product-skeleton-crumb" />
        </div>

        <section className="product-main product-loading-main" aria-hidden="true">
          <div className="product-gallery-column">
            <div className="product-image-box product-skeleton product-loading-image" />
            <div className="product-loading-thumbnails">
              <span className="product-skeleton" />
              <span className="product-skeleton" />
              <span className="product-skeleton" />
              <span className="product-skeleton" />
            </div>
          </div>

          <div className="product-info product-loading-info">
            <div className="product-loading-meta">
              <span className="product-skeleton product-skeleton-badge" />
              <span className="product-skeleton product-skeleton-brand" />
            </div>
            <span className="product-skeleton product-skeleton-category" />
            <span className="product-skeleton product-skeleton-title" />
            <span className="product-skeleton product-skeleton-title product-skeleton-title-short" />
            <span className="product-skeleton product-skeleton-description" />
            <div className="product-loading-rating">
              <span className="product-skeleton product-skeleton-stars" />
              <span className="product-skeleton product-skeleton-rating-count" />
            </div>
            <div className="product-loading-stock">
              <span className="product-skeleton product-skeleton-sku" />
              <span className="product-skeleton product-skeleton-stock" />
            </div>
            <div className="product-loading-price">
              <span className="product-skeleton product-skeleton-price" />
              <span className="product-skeleton product-skeleton-old-price" />
            </div>
            <div className="product-loading-options">
              <span className="product-skeleton product-skeleton-option-title" />
              <span className="product-skeleton product-skeleton-option" />
              <span className="product-skeleton product-skeleton-option" />
              <span className="product-skeleton product-skeleton-option" />
            </div>
            <div className="product-loading-actions">
              <span className="product-skeleton product-skeleton-quantity" />
              <span className="product-skeleton product-skeleton-action" />
            </div>
            <div className="product-skeleton product-skeleton-delivery" />
          </div>
        </section>

        <section className="product-loading-details" aria-hidden="true">
          <span className="product-skeleton product-skeleton-tab" />
          <span className="product-skeleton product-skeleton-tab" />
          <span className="product-skeleton product-skeleton-tab" />
          <div className="product-skeleton product-skeleton-details-content" />
        </section>
      </div>
    </main>
  );
}