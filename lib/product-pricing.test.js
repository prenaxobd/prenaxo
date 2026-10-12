import { describe, expect, it } from 'vitest';
import { getProductVariantPrice } from './product-pricing';

describe('getProductVariantPrice', () => {
  it('uses a weight variant sale price when configured', () => {
    expect(getProductVariantPrice(
      { name: '500 GM', regularPrice: 600, salePrice: 500 },
      { regularPrice: 900, salePrice: 800 }
    )).toBe(500);
  });

  it('uses the weight regular price when there is no sale price', () => {
    expect(getProductVariantPrice(
      { name: '1 KG', regularPrice: 1000, salePrice: null },
      { regularPrice: 900, salePrice: 800 }
    )).toBe(1000);
  });

  it('preserves legacy product option and base product price behavior', () => {
    expect(getProductVariantPrice(
      { price: 450 },
      { regularPrice: 600, salePrice: 500 }
    )).toBe(450);
    expect(getProductVariantPrice(
      null,
      { regularPrice: 600, salePrice: 500 }
    )).toBe(500);
  });
});
