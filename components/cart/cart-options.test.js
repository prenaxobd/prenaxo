import { describe, expect, it } from 'vitest';
import {
  getCartItemImage,
  getCartItemOptionLabels,
} from './cart-options';
import { getGalleryColorOptionId } from '../product/product-option-images';

describe('cart gallery color selections', () => {
  const product = {
    images: [
      { url: '/blue-front.jpg', alt: 'Blue front view' },
      { url: '/black-front.jpg', alt: 'Black front view' },
    ],
    attributeValues: [],
  };

  it('shows the selected gallery color in the cart option label', () => {
    expect(getCartItemOptionLabels({
      product,
      attributeValueIds: [getGalleryColorOptionId('Blue')],
    })).toBe('Blue');
  });

  it('uses the selected gallery color image in the cart', () => {
    expect(getCartItemImage({
      product,
      attributeValueIds: [getGalleryColorOptionId('Black')],
    })).toBe(product.images[1]);
  });
});
