export function getProductVariantPrice(variant, product) {
  if (variant?.name) {
    return Number(variant.salePrice ?? variant.regularPrice ?? 0);
  }

  return Number(variant?.price ?? product?.salePrice ?? product?.regularPrice ?? 0);
}
