import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';

export async function generateMetadata() {
  return {
    title: 'Search',
    robots: {
      index: false,
      follow: true,
    },
  };
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
    },
    orderBy: { name: 'asc' },
    skip: (safePage - 1) * productsPerPage,
    take: productsPerPage,
  });
  const searchHref = (nextPage) => {
    const nextParams = new URLSearchParams();
    if (query) nextParams.set('q', query);
    if (nextPage > 1) nextParams.set('page', String(nextPage));
    return `/search?${nextParams.toString()}`;
  };

  return (
    <main className="container">
      <div className="page-title">
        <div className="eyebrow" style={{ color: 'var(--coral)' }}>Search</div>
        <h1>{query ? `Results for “${query}”` : 'Find your next good thing'}</h1>
      </div>

      {products.length ? (
        <div className="shop-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="muted">No products matched your search.</p>
      )}

      {totalPages > 1 && (
        <nav aria-label="Search pagination">
          {safePage > 1 && <a href={searchHref(safePage - 1)}>Previous</a>}
          <span> Page {safePage} of {totalPages} </span>
          {safePage < totalPages && <a href={searchHref(safePage + 1)}>Next</a>}
        </nav>
      )}
    </main>
  );
}
