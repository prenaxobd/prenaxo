import { getCategorySubtreeIds } from './category-tree';

export function buildHomepageCategorySections(categories, products) {
  return categories
    .filter(category => !category.parentId)
    .map(category => {
      const productCategoryIds = new Set(
        getCategorySubtreeIds(categories, category.id)
      );

      return {
        ...category,
        products: products.filter(product =>
          productCategoryIds.has(product.categoryId)
        ),
      };
    })
    .filter(section => section.products.length > 0);
}

export function filterParentCategoryHomepageSections(sections) {
  return sections.filter(
    section => section.type !== 'CATEGORY' || !section.category?.parentId
  );
}
