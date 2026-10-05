function normalizeImageLabel(value) {
  return ` ${String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `;
}

function isColorAttribute(attribute) {
  return /colou?r/i.test(`${attribute?.slug || ''} ${attribute?.name || ''}`);
}

export function getColorOptionImage(product, colorValue) {
  const images = product?.images || [];
  if (!colorValue || !images.length) return null;

  const colorPrefix = normalizeImageLabel(colorValue.name);
  const taggedImage = images.find((image) =>
    normalizeImageLabel(image.alt).startsWith(colorPrefix)
  );
  if (taggedImage) return taggedImage;

  const colorValues = (product.attributeValues || [])
    .filter((item) => isColorAttribute(item.attributeValue?.attribute))
    .map((item) => item.attributeValue)
    .filter(Boolean);
  const colorIndex = colorValues.findIndex((value) => value.id === colorValue.id);

  return colorIndex >= 0 && images.length === colorValues.length
    ? images[colorIndex]
    : null;
}
