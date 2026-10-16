export function getCategoryCollectionUrl(parentSlug, subcategorySlug, searchParams = {}) {
  const query = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(searchParams || {})) {
    if (key === 'subcategory') continue;

    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    for (const value of values) {
      if (typeof value === 'string') {
        query.append(key, value);
      }
    }
  }

  query.set('subcategory', subcategorySlug);
  return `/category/${encodeURIComponent(parentSlug)}?${query.toString()}`;
}
