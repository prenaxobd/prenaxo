import { describe, expect, it } from 'vitest';
import { getCategoryCollectionUrl } from './category-navigation';

describe('getCategoryCollectionUrl', () => {
  it('keeps the selected subcategory on its parent collection URL', () => {
    expect(
      getCategoryCollectionUrl('mens-fashion', 'premium-hoodies', {
        brand: 'Prenaxo',
        page: '2',
      })
    ).toBe(
      '/category/mens-fashion?brand=Prenaxo&page=2&subcategory=premium-hoodies'
    );
  });

  it('replaces an existing subcategory and preserves repeated query values', () => {
    expect(
      getCategoryCollectionUrl('men & boys', 'shirts', {
        subcategory: 'old-category',
        brand: ['First', 'Second'],
      })
    ).toBe(
      '/category/men%20%26%20boys?brand=First&brand=Second&subcategory=shirts'
    );
  });
});
