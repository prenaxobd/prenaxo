import { describe, expect, it } from 'vitest';
import { getColorOptionImage } from './product-option-images';

describe('product color images', () => {
  const white = { id: 'white', name: 'White' };
  const product = {
    images: [
      { url: '/white-front.jpg', alt: 'White front view' },
      { url: '/navy-front.jpg', alt: 'Navy Blue front view' },
      { url: '/white-back.jpg', alt: 'WHITE back view' },
    ],
    attributeValues: [
      { attributeValue: { ...white, attribute: { name: 'Color', slug: 'color' } } },
      { attributeValue: { id: 'navy', name: 'Navy Blue', attribute: { name: 'Color', slug: 'color' } } },
    ],
  };

  it('returns the first image tagged for the selected color', () => {
    expect(getColorOptionImage(product, white).url).toBe('/white-front.jpg');
  });

  it('matches gallery labels despite punctuation and case differences', () => {
    const image = { url: '/dark-green.jpg', alt: 'Dark Green)' };
    expect(getColorOptionImage({ images: [image] }, { name: 'Dark Green' })).toBe(image);
  });

  it('uses the matching gallery position when images are not tagged', () => {
    const untaggedProduct = {
      ...product,
      images: [{ url: '/white.jpg' }, { url: '/navy.jpg' }],
    };

    expect(getColorOptionImage(untaggedProduct, white).url).toBe('/white.jpg');
  });

});
