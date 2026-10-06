import { describe, expect, it } from 'vitest';
import { getCategorySubtreeIds } from './category-tree';

describe('getCategorySubtreeIds', () => {
  const categories = [
    { id: 'root', parentId: null },
    { id: 'child', parentId: 'root' },
    { id: 'grandchild', parentId: 'child' },
    { id: 'other-root', parentId: null },
  ];

  it('includes the root and every nested descendant', () => {
    expect(getCategorySubtreeIds(categories, 'root').sort()).toEqual([
      'child',
      'grandchild',
      'root',
    ]);
  });

  it('returns only the selected branch for a subcategory', () => {
    expect(getCategorySubtreeIds(categories, 'child').sort()).toEqual([
      'child',
      'grandchild',
    ]);
  });

  it('keeps an empty branch to the selected category', () => {
    expect(getCategorySubtreeIds(categories, 'missing')).toEqual(['missing']);
  });
});
