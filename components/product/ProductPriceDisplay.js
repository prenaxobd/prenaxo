'use client';

import { useProductOptionSelection } from '@/components/product/ProductOptionContext';

export default function ProductPriceDisplay({ weightVariants = [], regularPrice, salePrice, price, hasDiscount, discount }) {
  const selection = useProductOptionSelection();
  const selectedVariant = weightVariants.find((variant) => variant.id === selection?.selectedWeightVariantId);
  const currentRegularPrice = selectedVariant
    ? Number(selectedVariant.regularPrice || 0)
    : regularPrice;
  const currentSalePrice = selectedVariant && selectedVariant.salePrice != null
    ? Number(selectedVariant.salePrice)
    : selectedVariant
      ? null
      : salePrice;
  const currentHasDiscount = selectedVariant
    ? currentSalePrice !== null && currentSalePrice < currentRegularPrice
    : hasDiscount;
  const currentPrice = selectedVariant
    ? (currentHasDiscount ? currentSalePrice : currentRegularPrice)
    : price;
  const currentDiscount = currentHasDiscount && currentRegularPrice > 0
    ? Math.round(((currentRegularPrice - currentSalePrice) / currentRegularPrice) * 100)
    : discount;

  return (
    <>
      <div className="product-price-main" aria-live="polite">
        <span className="current-price">৳{currentPrice.toLocaleString()}</span>
        {currentHasDiscount && (
          <span className="old-price">৳{currentRegularPrice.toLocaleString()}</span>
        )}
      </div>
      {currentHasDiscount && <span className="discount-badge">Save {currentDiscount}%</span>}
      {selectedVariant && <span className="product-selected-weight">{selectedVariant.name}</span>}
    </>
  );
}
