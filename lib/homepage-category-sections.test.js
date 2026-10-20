import { describe, expect, it } from 'vitest';
import {
  buildHomepageCategorySections,
  filterParentCategoryHomepageSections,
} from './homepage-category-sections';

describe('buildHomepageCategorySections', () => {
  const categories = [
    { id: 'fashion', name: 'Fashion', slug: 'fashion', parentId: null },
    { id: 'shirts', name: 'Shirts', slug: 'shirts', parentId: 'fashion' },
    { id: 'tees', name: 'T-shirts', slug: 't-shirts', parentId: 'shirts' },
    { id: 'home', name: 'Home', slug: 'home', parentId: null },
    { id: 'lamps', name: 'Lamps', slug: 'lamps', parentId: 'home' },
    { id: 'orphan', name: 'Orphan', slug: 'orphan', parentId: null },
  ];

  it('creates a single parent section with products from nested categories', () => {
    const products = [
      { id: 'shirt', categoryId: 'shirts' },
      { id: 'lamp', categoryId: 'lamps' },
      { id: 'tee', categoryId: 'tees' },
      { id: 'direct', categoryId: 'fashion' },
    ];

    expect(buildHomepageCategorySections(categories, products)).toEqual([
      {
        ...categories[0],
        products: [products[0], products[2], products[3]],
      },
      {
        ...categories[3],
        products: [products[1]],
      },
    ]);
  });

  it('keeps all matching products available for the configured section limit', () => {
    const products = Array.from({ length: 10 }, (_, index) => ({
      id: `shirt-${index}`,
      categoryId: 'shirts',
    }));

    expect(buildHomepageCategorySections(categories, products)[0].products)
      .toHaveLength(10);
  });

  it('omits parent categories without products', () => {
    expect(buildHomepageCategorySections(categories, [])).toEqual([]);
  });

  it('keeps parent category carousels and non-category sections only', () => {
    const sections = [
      { id: 'deals', type: 'DEALS' },
      { id: 'fashion', type: 'CATEGORY', category: categories[0] },
      { id: 'shirts', type: 'CATEGORY', category: categories[1] },
    ];

    expect(filterParentCategoryHomepageSections(sections)).toEqual([
      sections[0],
      sections[1],
    ]);
  });
});
