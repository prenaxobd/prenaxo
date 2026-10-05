import { getColorOptionImage } from '@/components/product/product-option-images';

export function getCartItemOptionLabels(item) {
  const variantLabels = [item.variant?.color, item.variant?.size];
  const selectedIds = new Set(item.attributeValueIds || []);
  const attributeLabels = (item.product?.attributeValues || [])
    .filter((attributeValue) =>
      selectedIds.has(attributeValue.attributeValueId || attributeValue.attributeValue?.id)
    )
    .map((attributeValue) => attributeValue.attributeValue?.name);
  const uniqueLabels = new Map();

  for (const label of [...variantLabels, ...attributeLabels]) {
    const normalized = String(label || '').trim();
    if (normalized && !uniqueLabels.has(normalized.toLowerCase())) {
      uniqueLabels.set(normalized.toLowerCase(), normalized);
    }
  }

  return [...uniqueLabels.values()].join(' / ');
}

export function getCartItemImage(item) {
  const images = item.product?.images || [];
  const selectedIds = new Set(item.attributeValueIds || []);
  const selectedColors = (item.product?.attributeValues || [])
    .filter((attributeValue) => {
      const attribute = attributeValue.attributeValue?.attribute;
      const attributeName = `${attribute?.slug || ''} ${attribute?.name || ''}`.toLowerCase();
      const valueId = attributeValue.attributeValueId || attributeValue.attributeValue?.id;
      return /colou?r/.test(attributeName) && selectedIds.has(valueId);
    })
    .map((attributeValue) => attributeValue.attributeValue)
    .filter(Boolean);

  for (const color of selectedColors) {
    const image = getColorOptionImage(item.product, color);
    if (image) return image;
  }

  return images[0] || null;
}
