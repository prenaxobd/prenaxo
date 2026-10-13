'use client';

import { useProductOptionSelection } from '@/components/product/ProductOptionContext';

export default function ProductWeightStockDisplay({ weightVariants = [], fallbackStock = 0 }) {
  const selection = useProductOptionSelection();
  const selectedVariant = weightVariants.find(
    (variant) => variant.id === selection?.selectedWeightVariantId
  );

  if (!selectedVariant) {
    return `${fallbackStock} available`;
  }

  const stock = Number(selectedVariant.stock || 0);
  return `${selectedVariant.name}: ${stock > 0 ? `${stock} available` : 'Out of stock'}`;
}
