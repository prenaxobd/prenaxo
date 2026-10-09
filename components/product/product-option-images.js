function normalizeImageLabel(value) {
  return ` ${String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `;
}

function isColorAttribute(attribute) {
  return String(attribute?.kind || '').toUpperCase() === 'COLOR' ||
    /colou?r/i.test(`${attribute?.slug || ''} ${attribute?.name || ''}`);
}

const GALLERY_COLOR_PREFIX = 'gallery-color:';

function normalizeColorName(value) {
  return String(value || '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase();
}

export function getGalleryColorOptionId(name) {
  return `${GALLERY_COLOR_PREFIX}${encodeURIComponent(String(name || '').trim())}`;
}

export function getGalleryColorNameFromId(id) {
  if (typeof id !== 'string' || !id.startsWith(GALLERY_COLOR_PREFIX)) return null;

  try {
    return decodeURIComponent(id.slice(GALLERY_COLOR_PREFIX.length));
  } catch {
    return null;
  }
}

function getAltColorLabel(alt, productName, knownColors) {
  const text = String(alt || '').trim();
  const normalizedText = normalizeColorName(text);
  const normalizedProductName = normalizeColorName(productName);
  if (
    !normalizedText ||
    normalizedText === normalizedProductName ||
    (normalizedProductName && normalizeImageLabel(text).startsWith(normalizeImageLabel(productName)))
  ) return '';

  const matchingColor = knownColors
    .filter((color) => normalizeImageLabel(text).startsWith(normalizeImageLabel(color.name)))
    .sort((left, right) => normalizeColorName(right.name).length - normalizeColorName(left.name).length)[0];
  if (matchingColor) return matchingColor.name;

  return text
    .split(/\s*(?:\||—|–|:)\s*/)[0]
    .replace(/\s+(?:(?:front|back|side|rear|close[- ]?up|detail|lifestyle|angle|view|image|photo)\b[\s]*)+$/i, '')
    .trim();
}

export function getGalleryColorOptions(product) {
  const images = product?.images || [];
  const knownColors = (product?.attributeValues || [])
    .map((item) => item.attributeValue)
    .filter((value) => value && isColorAttribute(value.attribute));
  const options = new Map();

  for (const image of images) {
    const name = getAltColorLabel(image.alt, product?.name, knownColors);
    const key = normalizeColorName(name);
    if (!key) continue;

    if (!options.has(key)) {
      options.set(key, {
        id: getGalleryColorOptionId(name),
        name,
        images: [],
      });
    }
    options.get(key).images.push(image);
  }

  return [...options.values()];
}

export function getProductOptionGroups(product) {
  const groups = (product?.category?.attributes || [])
    .map(({ attribute }) => ({
      ...attribute,
      values: (attribute.values || []).filter((value) =>
        product.attributeValues?.some((item) =>
          (item.attributeValueId || item.attributeValue?.id) === value.id
        )
      ),
    }))
    .filter((attribute) => attribute.values.length > 0);
  const galleryColors = getGalleryColorOptions(product);

  if (!galleryColors.length) return groups;

  const colorGroupIndex = groups.findIndex(({ kind, slug, name }) =>
    String(kind || '').toUpperCase() === 'COLOR' ||
    /colou?r/i.test(`${slug || ''} ${name || ''}`)
  );
  const existingColorValues = colorGroupIndex >= 0
    ? groups[colorGroupIndex].values
    : [];
  const values = galleryColors.map((option) => {
    const existingValue = existingColorValues.find((value) =>
      normalizeColorName(value.name) === normalizeColorName(option.name)
    );
    return existingValue || {
      id: option.id,
      name: option.name,
      hexValue: null,
    };
  });

  if (colorGroupIndex >= 0) {
    groups[colorGroupIndex] = { ...groups[colorGroupIndex], values };
  } else {
    groups.push({
      id: 'gallery-color',
      name: 'Color',
      slug: 'color',
      kind: 'COLOR',
      values,
    });
  }

  return groups;
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
