import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';

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
  const query = (await searchParams).q || '';
  const tokens = normalizeSearchTokens(query);

  const products = await prisma.product.findMany({
    where: {
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
    },
    include: { category: true, images: true },
  });

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
    </main>
  );
}
