import { describe, expect, it } from 'vitest';
import {
  getColorOptionImage,
  getGalleryColorNameFromId,
  getGalleryColorOptionId,
  getGalleryColorOptions,
  getProductOptionGroups,
} from './product-option-images';

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

  it('builds color choices from gallery alt text and groups images with the same color', () => {
    const options = getGalleryColorOptions({
      name: 'Premium Watch',
      images: [
        { url: '/blue-front.jpg', alt: 'Blue front view' },
        { url: '/blue-back.jpg', alt: 'BLUE back view' },
        { url: '/black.jpg', alt: 'Black' },
        { url: '/main.jpg', alt: 'Premium Watch' },
      ],
    });

    expect(options.map(({ name, images }) => [name, images.length])).toEqual([
      ['Blue', 2],
      ['Black', 1],
    ]);
  });

  it('uses category color names as the prefix of descriptive gallery alt text', () => {
    const options = getGalleryColorOptions({
      images: [{ url: '/navy.jpg', alt: 'Navy Blue side view' }],
      attributeValues: [
        { attributeValue: { id: 'navy', name: 'Navy Blue', attribute: { name: 'Color' } } },
      ],
    });

    expect(options[0].name).toBe('Navy Blue');
  });

  it('encodes gallery color names for cart selections and decodes them for display', () => {
    const id = getGalleryColorOptionId('Full Silver');
    expect(getGalleryColorNameFromId(id)).toBe('Full Silver');
    expect(getGalleryColorNameFromId('unrelated-value')).toBeNull();
  });

  it('uses gallery colors as the color group while keeping other category options', () => {
    const productWithOptions = {
      images: [{ url: '/blue.jpg', alt: 'Blue' }, { url: '/black.jpg', alt: 'Black' }],
      attributeValues: [
        { attributeValueId: 'large', attributeValue: { id: 'large', name: 'Large' } },
      ],
      category: {
        attributes: [
          { attribute: { id: 'color', name: 'Color', slug: 'color', kind: 'COLOR', values: [{ id: 'red', name: 'Red' }] } },
          { attribute: { id: 'size', name: 'Size', slug: 'size', kind: 'TEXT', values: [{ id: 'large', name: 'Large' }] } },
        ],
      },
    };

    const groups = getProductOptionGroups(productWithOptions);
    expect(groups.map((group) => group.name)).toEqual(['Size', 'Color']);
    expect(groups[1].values.map((value) => value.name)).toEqual(['Blue', 'Black']);
  });

});
