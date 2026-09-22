export default function Loading() {
  return (
    <main className="shop-page shop-loading" aria-busy="true">
      <div className="container shop-page-inner">
        <div className="shop-loading-breadcrumb" aria-hidden="true">
          <span className="shop-skeleton shop-skeleton-crumb" />
          <span className="shop-skeleton shop-skeleton-separator" />
          <span className="shop-skeleton shop-skeleton-crumb shop-skeleton-crumb-current" />
        </div>

        <header className="shop-heading shop-loading-heading" aria-hidden="true">
          <span className="shop-skeleton shop-skeleton-heading" />
          <span className="shop-skeleton shop-skeleton-result" />
        </header>

        <div className="shop-loading-mobile-actions" aria-hidden="true">
          <span className="shop-skeleton" />
          <span className="shop-skeleton" />
          <span className="shop-skeleton" />
        </div>

        <div className="shop-layout shop-loading-layout" aria-hidden="true">
          <aside className="shop-filters shop-loading-filters">
            <span className="shop-skeleton shop-skeleton-filter-title" />
            <span className="shop-skeleton shop-skeleton-filter-line" />
            <span className="shop-skeleton shop-skeleton-filter-line" />
            <span className="shop-skeleton shop-skeleton-filter-line" />
            <span className="shop-skeleton shop-skeleton-filter-line" />
            <span className="shop-skeleton shop-skeleton-filter-heading" />
            <span className="shop-skeleton shop-skeleton-filter-line" />
            <span className="shop-skeleton shop-skeleton-filter-line" />
            <span className="shop-skeleton shop-skeleton-filter-line" />
            <span className="shop-skeleton shop-skeleton-filter-heading" />
            <span className="shop-skeleton shop-skeleton-filter-line" />
            <span className="shop-skeleton shop-skeleton-filter-line" />
          </aside>

          <section className="shop-loading-results">
            <div className="shop-loading-toolbar">
              <span className="shop-skeleton shop-skeleton-sort" />
              <span className="shop-skeleton shop-skeleton-view-toggle" />
            </div>
            <div className="shop-loading-grid">
              {Array.from({ length: 8 }, (_, index) => (
                <article className="shop-loading-card" key={index}>
                  <span className="shop-skeleton shop-skeleton-card-image" />
                  <span className="shop-skeleton shop-skeleton-card-category" />
                  <span className="shop-skeleton shop-skeleton-card-title" />
                  <span className="shop-skeleton shop-skeleton-card-title shop-skeleton-card-title-short" />
                  <span className="shop-skeleton shop-skeleton-card-price" />
                  <span className="shop-skeleton shop-skeleton-card-button" />
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}