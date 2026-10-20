import { describe, expect, it } from 'vitest';
import { interleaveProductsByCategory } from './interleave-products-by-category';

describe('interleaveProductsByCategory', () => {
  it('interleaves categories while preserving newest-first order within each category', () => {
    const products = [
      { id: 'food-new', categoryId: 'food' },
      { id: 'food-old', categoryId: 'food' },
      { id: 'fashion-new', categoryId: 'fashion' },
      { id: 'fashion-old', categoryId: 'fashion' },
      { id: 'home-new', categoryId: 'home' },
    ];

    expect(interleaveProductsByCategory(products).map(({ id }) => id)).toEqual([
      'food-new',
      'fashion-new',
      'home-new',
      'food-old',
      'fashion-old',
    ]);
  });

  it('keeps uncategorized products and all input products', () => {
    const products = [
      { id: 'uncategorized-new', categoryId: null },
      { id: 'categorized', categoryId: 'food' },
      { id: 'uncategorized-old', categoryId: null },
    ];

    expect(interleaveProductsByCategory(products).map(({ id }) => id)).toEqual([
      'uncategorized-new',
      'categorized',
      'uncategorized-old',
    ]);
  });
});
