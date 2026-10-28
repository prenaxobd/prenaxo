import { describe, expect, it } from 'vitest';
import { SITE_URL, absoluteUrl, getCanonical } from './seo';

describe('canonical URL helpers', () => {
  it('uses the route URL when a saved canonical points off-site', () => {
    expect(
      getCanonical(
        'https://staging.prenaxo.com/product/old',
        '/product/current'
      )
    ).toBe(absoluteUrl('/product/current'));
  });

  it('keeps same-site canonical paths but removes query and fragment', () => {
    const savedCanonical = new URL(
      '/product/current?variant=large#details',
      SITE_URL
    ).toString();

    expect(getCanonical(savedCanonical, '/product/fallback')).toBe(
      new URL('/product/current', SITE_URL).toString()
    );
  });
});
