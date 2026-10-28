import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';
import { getPageMetadata } from '@/lib/seo';
import styles from './search.module.css';

export async function generateMetadata() {
  return getPageMetadata({
    title: 'Search',
    description: 'Search products available in the Prenaxo online store.',
    path: '/search',
    robots: { index: false, follow: true },
  });
}

function normalizeSearchTokens(rawQuery) {
  const trimmed = (rawQuery || '').trim();
  if (!trimmed) return [];

  return Array.from(
    new Set(
      trimmed
        .split(/\s+/)
        .map((token) => token.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '').trim())
        .filter(Boolean)
    )
  );
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params.q || '';
  const page = Math.max(1, Number(params.page) || 1);
  const productsPerPage = 24;
  const tokens = normalizeSearchTokens(query);

  const where = {
    active: true,
    ...(tokens.length
      ? {
          OR: [
            ...tokens.map((token) => ({ name: { contains: token } })),
            ...tokens.map((token) => ({ sku: { contains: token } })),
            ...tokens.map((token) => ({ brand: { contains: token } })),
            ...tokens.map((token) => ({ shortDescription: { contains: token } })),
            ...tokens.map((token) => ({ description: { contains: token } })),
            ...tokens.map((token) => ({ category: { is: { name: { contains: token } } } })),
          ],
        }
      : {}),
  };

  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / productsPerPage));
  const safePage = Math.min(page, totalPages);
  const products = await prisma.product.findMany({
    where: {
      ...where,
    },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      variants: true,
    },
    orderBy: { name: 'asc' },
    skip: (safePage - 1) * productsPerPage,
    take: productsPerPage,
  });
  const serializedProducts = products.map((product) => ({
    ...product,
    regularPrice: product.regularPrice === null ? null : Number(product.regularPrice),
    salePrice: product.salePrice === null ? null : Number(product.salePrice),
    costPrice: product.costPrice === null ? null : Number(product.costPrice),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: variant.price === null ? null : Number(variant.price),
      regularPrice: variant.regularPrice === null ? null : Number(variant.regularPrice),
      salePrice: variant.salePrice === null ? null : Number(variant.salePrice),
    })),
  }));
  const searchHref = (nextPage) => {
    const nextParams = new URLSearchParams();
    if (query) nextParams.set('q', query);
    if (nextPage > 1) nextParams.set('page', String(nextPage));
    return `/search?${nextParams.toString()}`;
  };

  return (
    <main className={`container ${styles.searchPage}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Search</p>
        <h1>{query ? `Results for “${query}”` : 'Find your next good thing'}</h1>
        {query && <p className={styles.query}>Showing products matching “{query}”</p>}
      </header>

      <div className={styles.resultsSummary} aria-live="polite">
        <span>{total.toLocaleString()} {total === 1 ? 'product' : 'products'} found</span>
        {totalPages > 1 && <span>Page {safePage} of {totalPages}</span>}
      </div>

      {products.length ? (
        <div className={styles.resultsGrid}>
          {serializedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <section className={styles.emptyState}>
          <h2>No products found</h2>
          <p>Try another search term or check the spelling.</p>
        </section>
      )}

      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Search pagination">
          {safePage > 1 && <a href={searchHref(safePage - 1)}>Previous</a>}
          {safePage < totalPages && <a href={searchHref(safePage + 1)}>Next</a>}
        </nav>
      )}
    </main>
  );
}
