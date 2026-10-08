'use client';

import { Heart, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import OptimizedImage from '@/components/OptimizedImage';
import { useCart } from '@/components/cart/CartProvider';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { useAccountRequired } from '@/components/auth/AccountRequiredProvider';
import { useProductOptionSelection } from '@/components/product/ProductOptionContext';
import { getColorOptionImage } from '@/components/product/product-option-images';

const NO_OPTION_IDS = [];

function isColorAttribute(attribute) {
  return String(attribute?.kind || '').toUpperCase() === 'COLOR' ||
    /colou?r/i.test(`${attribute?.slug || ''} ${attribute?.name || ''}`);
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeKey(value) {
  return normalize(value).replace(/[-_ ]/g, '');
}

function getVariantAttributeValueIds(variant, groups) {
  const linkedIds = (variant?.attributeValues || [])
    .map((item) => item.attributeValueId || item.attributeValue?.id)
    .filter(Boolean);

  const legacyIds = groups.flatMap((group) => {
    const key = normalizeKey(group.slug || group.name);
    const variantValue = variant?.[key] ?? variant?.[group.slug] ?? variant?.[group.name];
    const match = group.values.find((value) => normalize(value.name) === normalize(variantValue));
    return match ? [match.id] : [];
  });

  return [...new Set([...linkedIds, ...legacyIds])];
}

function getVariantForSelection(variants, selectedIds, groups) {
  const compatibleVariants = variants
    .map((variant) => ({
      variant,
      valueIds: getVariantAttributeValueIds(variant, groups),
    }))
    .filter(({ valueIds }) =>
      valueIds.length > 0 && valueIds.every((id) => selectedIds.includes(id))
    );

  const exactVariant = compatibleVariants.find(({ valueIds }) =>
    valueIds.length === selectedIds.length
  );

  return exactVariant?.variant
    || compatibleVariants.sort((left, right) => right.valueIds.length - left.valueIds.length)[0]?.variant
    || null;
}

function getVariantForSizeSelection(variants, selectedIds, sizeValueId, groups) {
  const variant = getVariantForSelection(variants, selectedIds, groups);
  return getVariantAttributeValueIds(variant, groups).includes(sizeValueId)
    ? variant
    : null;
}

function getCombinationKey(ids) {
  return [...ids].sort().join(',');
}

function getCombinations(groups, selectedIds) {
  if (!groups.length || groups.some((group) =>
    !group.values.some((value) => selectedIds.includes(value.id))
  )) {
    return [];
  }

  return groups.reduce((combinations, group) => {
    const values = group.values.filter((value) => selectedIds.includes(value.id));
    return combinations.flatMap((combination) =>
      values.map((value) => [...combination, value.id])
    );
  }, [[]]);
}

export default function ProductActions({
  product,
  productId,
  disabled = false,
}) {
  const router = useRouter();
  const cart = useCart();
  const wishlistStore = useWishlist();
  const { requireAccount, showAccountRequired } = useAccountRequired();
  const optionSelection = useProductOptionSelection();
  const selectedAttributeValueIds = optionSelection
    ? optionSelection.selectedAttributeValueIds
    : NO_OPTION_IDS;
  const setSelectedAttributeValueIds = optionSelection?.setSelectedAttributeValueIds || (() => {});
  const cartProduct = useMemo(() => product || { id: productId }, [product, productId]);
  const variants = useMemo(
    () => (Array.isArray(cartProduct.variants) ? cartProduct.variants : []),
    [cartProduct.variants]
  );
  const [quantities, setQuantities] = useState({});
  const [removedCombinationKeys, setRemovedCombinationKeys] = useState(() => new Set());
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const saved = wishlistStore?.isSaved(cartProduct.id) || false;

  const attributeGroups = useMemo(() => (
    (cartProduct.category?.attributes || [])
      .map(({ attribute }) => ({
        ...attribute,
        values: (attribute.values || []).filter((value) =>
          cartProduct.attributeValues?.some((item) =>
            (item.attributeValueId || item.attributeValue?.id) === value.id
          )
        ),
      }))
      .filter((attribute) => attribute.values.length > 0)
  ), [cartProduct]);

  const hasAttributeOptions = attributeGroups.length > 0;
  const colorGroup = attributeGroups.find(isColorAttribute);
  const sizeGroup = attributeGroups.find((attribute) =>
    /size/i.test(`${attribute.slug || ''} ${attribute.name || ''}`)
  );
  const supportsSizeMatrix = Boolean(sizeGroup) &&
    attributeGroups.every((attribute) =>
      attribute.id === sizeGroup.id || attribute.id === colorGroup?.id
    );
  const variantsHaveOptionValues = variants.some((variant) =>
    getVariantAttributeValueIds(variant, attributeGroups).length > 0
  );
  const allSelectedCombinations = useMemo(
    () => getCombinations(attributeGroups, selectedAttributeValueIds),
    [attributeGroups, selectedAttributeValueIds]
  );
  const selectedCombinations = allSelectedCombinations.filter(
    (combination) => !removedCombinationKeys.has(getCombinationKey(combination))
  );
  const selectedEntries = selectedCombinations.map((attributeValueIds) => {
    const variant = variantsHaveOptionValues
      ? getVariantForSelection(variants, attributeValueIds, attributeGroups)
      : null;
    const selectedValues = attributeGroups.flatMap((group) =>
      group.values.filter((value) => attributeValueIds.includes(value.id))
    );
    const key = getCombinationKey(attributeValueIds);

    return {
      attributeValueIds,
      key,
      variant,
      selectedValues,
      quantity: quantities[key] || 1,
      stockKey: variant?.id || cartProduct.id,
      stock: Number(variant?.stock ?? cartProduct.stock ?? 0),
      price: Number(variant?.price ?? cartProduct.salePrice ?? cartProduct.regularPrice ?? 0),
    };
  });
  const requestedByStock = selectedEntries.reduce((totals, entry) => ({
    ...totals,
    [entry.stockKey]: (totals[entry.stockKey] || 0) + entry.quantity,
  }), {});
  const entriesWithAvailableStock = selectedEntries.map((entry) => {
    const otherRequested = selectedEntries
      .filter((other) => other.stockKey === entry.stockKey && other.key !== entry.key)
      .reduce((total, other) => total + other.quantity, 0);

    return {
      ...entry,
      availableQuantity: Math.max(0, entry.stock - otherRequested),
      allocatedQuantity: requestedByStock[entry.stockKey],
    };
  });
  const hasUnavailableSelection = selectedEntries.some((entry) =>
    entry.stock <= 0 || (variantsHaveOptionValues && !entry.variant) || entry.quantity > entry.stock
  ) || Object.entries(requestedByStock).some(([stockKey, requested]) => {
    const stock = selectedEntries.find((entry) => entry.stockKey === stockKey)?.stock || 0;
    return requested > stock;
  });
  const needsOptionSelection = hasAttributeOptions && selectedCombinations.length === 0;
  const unavailable = disabled || needsOptionSelection || hasUnavailableSelection;

  function toggleAttributeValue(attribute, valueId) {
    if (!attribute.values.some((value) => value.id === valueId)) return;

    setSelectedAttributeValueIds((current) => {
      const groupValueIds = new Set(attribute.values.map((value) => value.id));
      return current.includes(valueId)
        ? current
        : [...current.filter((id) => !groupValueIds.has(id)), valueId];
    });
    setRemovedCombinationKeys(new Set());
    setMessage('');
  }

  function clearSelections() {
    setSelectedAttributeValueIds([]);
    setRemovedCombinationKeys(new Set());
    setQuantities({});
    setMessage('');
  }

  function removeCombination(key) {
    setRemovedCombinationKeys((current) => new Set([...current, key]));
  }

  function getOptionAvailability(attribute, value) {
    const groupValueIds = new Set(attribute.values.map((option) => option.id));
    const variantsTrackThisGroup = variants.some((variant) =>
      getVariantAttributeValueIds(variant, attributeGroups)
        .some((id) => groupValueIds.has(id))
    );

    if (!variantsHaveOptionValues || !variantsTrackThisGroup) {
      return Number(cartProduct.stock || 0) > 0 ||
        variants.some((variant) => Number(variant.stock || 0) > 0);
    }

    return variants.some((variant) =>
      Number(variant.stock || 0) > 0 &&
      getVariantAttributeValueIds(variant, attributeGroups).includes(value.id)
    );
  }

  function getOptionImage(value) {
    return getColorOptionImage(cartProduct, value);
  }

  function setEntryQuantity(key, nextQuantity, maxQuantity) {
    setQuantities((current) => ({
      ...current,
      [key]: Math.max(1, Math.min(maxQuantity, nextQuantity)),
    }));
  }

  function createCartProduct(entry) {
    return {
      ...cartProduct,
      variantId: entry.variant?.id || null,
      attributeValueIds: entry.attributeValueIds,
      stock: entry.stock,
      salePrice: entry.variant?.price ?? cartProduct.salePrice,
      regularPrice: entry.variant?.price ?? cartProduct.regularPrice,
    };
  }

  function getSizeRow(sizeValue) {
    const selectedColorIds = colorGroup
      ? selectedAttributeValueIds.filter((id) =>
          colorGroup.values.some((value) => value.id === id)
        )
      : [];
    const attributeValueIds = [...selectedColorIds, sizeValue.id];
    const variant = variantsHaveOptionValues
      ? getVariantForSizeSelection(variants, attributeValueIds, sizeValue.id, attributeGroups)
      : null;
    const stock = Number(variant?.stock ?? cartProduct.stock ?? 0);
    const stockKey = variant?.id || cartProduct.id;
    const requestedQuantity = (cart.items || [])
      .filter((item) =>
        item.productId === cartProduct.id &&
        (item.variantId || cartProduct.id) === stockKey
      )
      .reduce((total, item) => total + Number(item.quantity || 0), 0);
    const key = getCombinationKey(attributeValueIds);

    return {
      attributeValueIds,
      key,
      variant,
      stock,
      availableQuantity: Math.max(0, stock - requestedQuantity),
      price: Number(variant?.price ?? cartProduct.salePrice ?? cartProduct.regularPrice ?? 0),
      quantity: quantities[key] || 1,
      unavailable: stock <= requestedQuantity || (variantsHaveOptionValues && !variant),
    };
  }

  async function addSizeRow(sizeValue, buyNowAfterAdd = false) {
    const entry = getSizeRow(sizeValue);
    if (entry.unavailable || entry.quantity > entry.availableQuantity) {
      setMessage('This size and color combination is unavailable.');
      return;
    }

    try {
      if (!(await requireAccount())) return;
    } catch (error) {
      setMessage(error.message || 'Could not verify your account. Please try again.');
      return;
    }

    const result = await cart.add({
      ...cartProduct,
      variantId: entry.variant?.id || null,
      attributeValueIds: entry.attributeValueIds,
      stock: entry.stock,
      salePrice: entry.variant?.price ?? cartProduct.salePrice,
      regularPrice: entry.variant?.price ?? cartProduct.regularPrice,
    }, entry.quantity);

    if (!result.ok) {
      setMessage(result.error || 'Unable to add item.');
      return;
    }

    setMessage(`${sizeValue.name} added to cart.`);
    if (buyNowAfterAdd) router.push('/checkout');
  }

  async function addSelectedItems() {
    setMessage('');

    if (unavailable) {
      setMessage(
        needsOptionSelection
          ? `Please select ${attributeGroups.map((group) => group.name).join(' and ')}.`
          : 'One or more selected options are unavailable.'
      );
      return false;
    }

    try {
      if (!(await requireAccount())) return false;
    } catch (error) {
      setMessage(error.message || 'Could not verify your account. Please try again.');
      return false;
    }

    const entries = hasAttributeOptions
      ? selectedEntries
      : [{
          attributeValueIds: [],
          key: '',
          variant: null,
          selectedValues: [],
          quantity,
          stock: Number(cartProduct.stock || 0),
        }];

    const addedQuantity = entries.reduce((total, entry) => total + entry.quantity, 0);
    const result = await cart.addMany(
      entries.map((entry) => ({
        product: createCartProduct(entry),
        quantity: entry.quantity,
      }))
    );

    if (!result.ok) {
      setMessage(result.error || 'Unable to add item.');
      return false;
    }

    setMessage(`${addedQuantity} item${addedQuantity === 1 ? '' : 's'} added to cart.`);
    return true;
  }

  async function buyNow() {
    if (await addSelectedItems()) router.push('/checkout');
  }

  async function wishlist() {
    if (!wishlistStore?.ready || wishlistBusy) return;
    setWishlistBusy(true);
    try {
      if (!(await requireAccount())) return;
      const data = await wishlistStore.toggle(cartProduct.id);
      setMessage(data.saved ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch (error) {
      if (error.status === 401) {
        showAccountRequired();
        return;
      }
      setMessage(error.message || 'Unable to update wishlist.');
    } finally {
      setWishlistBusy(false);
    }
  }

  return (
    <>
      {attributeGroups
        .filter((attribute) => !(supportsSizeMatrix && attribute.id === sizeGroup.id))
        .map((attribute) => {
          const isColor = isColorAttribute(attribute);
          const selectedValues = attribute.values
            .filter((value) => selectedAttributeValueIds.includes(value.id))
            .map((value) => value.name);

          return (
            <fieldset className="product-variation" key={attribute.id}>
              <legend className="variation-title">
                {attribute.name}
                <span className="variation-selection-hint">
                  {selectedValues.join(', ') || (isColor ? 'Select a color' : 'Select one or more')}
                </span>
              </legend>
              <div className="variation-options">
                {attribute.values.map((value) => {
                  const selected = selectedAttributeValueIds.includes(value.id);
                  const available = getOptionAvailability(attribute, value);
                  const optionImage = isColor ? getOptionImage(value) : null;

                  return (
                    <button
                      type="button"
                      key={value.id}
                      className={`variation-option ${optionImage ? 'variation-image-option' : ''} ${selected ? 'selected' : ''} ${!available ? 'option-unavailable' : ''}`}
                      disabled={!available}
                      onClick={() => toggleAttributeValue(attribute, value.id)}
                      aria-pressed={selected}
                      aria-label={`${value.name}${available ? '' : ', out of stock'}`}
                    >
                      {optionImage?.url
                        ? <OptimizedImage src={optionImage.url} alt="" className="variation-option-image"/>
                        : isColor && value.hexValue && (
                          <span className="variation-color-swatch" style={{ backgroundColor: value.hexValue }} aria-hidden="true"/>
                        )}
                      <span>{value.name}</span>
                      {selected && <span className="variation-check" aria-hidden="true">✓</span>}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

      {supportsSizeMatrix && (
        <section className="product-size-matrix" aria-label="Choose size and add to cart">
          <div className="product-size-matrix-heading">
            <strong>Size</strong>
            <strong>Price</strong>
            <strong>Stock / Add</strong>
          </div>
          {colorGroup && !selectedAttributeValueIds.some((id) =>
            colorGroup.values.some((value) => value.id === id)
          ) ? (
            <p className="product-size-matrix-hint">Select a color to see available sizes.</p>
          ) : sizeGroup.values.map((sizeValue) => {
            const entry = getSizeRow(sizeValue);
            const quantityText = entry.variant
              ? `${entry.availableQuantity} in stock`
              : `${entry.availableQuantity} total`;

            return (
              <div className="product-size-matrix-row" key={sizeValue.id}>
                <strong>{sizeValue.name}</strong>
                <strong className="product-size-matrix-price">
                  ৳{entry.price.toLocaleString()}
                </strong>
                <div className="product-size-matrix-actions">
                  <span className={entry.unavailable ? 'is-out-of-stock' : ''}>
                    {entry.unavailable ? 'Unavailable' : quantityText}
                  </span>
                  <div className="product-qty product-size-matrix-qty" aria-label={`${sizeValue.name} quantity`}>
                    <button
                      type="button"
                      disabled={entry.unavailable || entry.quantity <= 1}
                      onClick={() => setEntryQuantity(entry.key, entry.quantity - 1, entry.availableQuantity)}
                      aria-label={`Decrease ${sizeValue.name} quantity`}
                    ><Minus size={12}/></button>
                    <span>{entry.quantity}</span>
                    <button
                      type="button"
                      disabled={entry.unavailable || entry.quantity >= entry.availableQuantity}
                      onClick={() => setEntryQuantity(entry.key, entry.quantity + 1, entry.availableQuantity)}
                      aria-label={`Increase ${sizeValue.name} quantity`}
                    ><Plus size={12}/></button>
                  </div>
                  <button
                    type="button"
                    disabled={entry.unavailable || entry.quantity > entry.availableQuantity}
                    onClick={() => void addSizeRow(sizeValue)}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="product-size-buy-now"
                    disabled={entry.unavailable || entry.quantity > entry.availableQuantity}
                    onClick={() => void addSizeRow(sizeValue, true)}
                  >
                    Buy now
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {hasAttributeOptions && selectedCombinations.length === 0 && (
        !supportsSizeMatrix && <p className="product-option-hint">
          Choose at least one {attributeGroups.map((group) => group.name.toLowerCase()).join(' and ')} option to set quantities.
        </p>
      )}

      {!supportsSizeMatrix && hasAttributeOptions && allSelectedCombinations.length > 0 && (
        <section className="selected-variant-list" aria-label="Selected option quantities">
          <div className="selected-variant-heading">
            <strong>Your selections</strong>
            <span>{selectedEntries.length} combination{selectedEntries.length === 1 ? '' : 's'}</span>
            <button type="button" className="selected-variant-clear" onClick={clearSelections}>
              Clear all
            </button>
          </div>
          {entriesWithAvailableStock.length > 0 ? entriesWithAvailableStock.map((entry) => {
            const optionLabel = entry.selectedValues.map((value) => value.name).join(' / ');
            const entryUnavailable = entry.stock <= 0 || (variantsHaveOptionValues && !entry.variant);

            return (
              <div className="selected-variant-row" key={entry.key}>
                <div className="selected-variant-info">
                  <strong>{optionLabel}</strong>
                  <span className={entryUnavailable || entry.availableQuantity < 1 ? 'is-out-of-stock' : ''}>
                    {entryUnavailable
                      ? 'Unavailable'
                      : entry.availableQuantity < 1
                        ? 'Not enough stock for all selections'
                        : `${entry.stock} in stock`}
                  </span>
                </div>
                <strong className="selected-variant-price">৳{entry.price.toLocaleString()}</strong>
                <div className="product-qty product-variant-qty" aria-label={`${optionLabel} quantity`}>
                  <button
                    type="button"
                    disabled={entryUnavailable || entry.quantity <= 1}
                    onClick={() => setEntryQuantity(entry.key, entry.quantity - 1, entry.availableQuantity)}
                    aria-label={`Decrease ${optionLabel} quantity`}
                  ><Minus size={13}/></button>
                  <span>{entry.quantity}</span>
                  <button
                    type="button"
                    disabled={entryUnavailable || entry.quantity >= entry.availableQuantity}
                    onClick={() => setEntryQuantity(entry.key, entry.quantity + 1, entry.availableQuantity)}
                    aria-label={`Increase ${optionLabel} quantity`}
                  ><Plus size={13}/></button>
                </div>
                <button
                  type="button"
                  className="selected-variant-remove"
                  onClick={() => removeCombination(entry.key)}
                  aria-label={`Remove ${optionLabel} from selections`}
                  title={`Remove ${optionLabel}`}
                ><Trash2 size={15}/></button>
              </div>
            );
          }) : (
            <p className="selected-variant-empty">No combinations selected. Change an option to add it back.</p>
          )}
        </section>
      )}

      {!supportsSizeMatrix && (
        <div className={`product-action-controls ${hasAttributeOptions ? 'has-variant-options' : ''}`}>
        {!hasAttributeOptions && (
          <div className="product-qty" aria-label="Quantity selector">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              aria-label="Decrease quantity"
            ><Minus size={15}/></button>
            <span>{quantity}</span>
            <button
              type="button"
              disabled={quantity >= Number(cartProduct.stock || 0)}
              onClick={() => setQuantity((current) => Math.min(Number(cartProduct.stock || 0), current + 1))}
              aria-label="Increase quantity"
            ><Plus size={15}/></button>
          </div>
        )}
        <div className="product-action-buttons">
          <button
            type="button"
            className="btn product-primary-btn"
            disabled={unavailable}
            onClick={() => void addSelectedItems()}
          >
            <ShoppingBag size={17}/>
            <span>Add to cart</span>
          </button>
          <button
            type="button"
            className="btn product-secondary-btn"
            disabled={unavailable}
            onClick={() => void buyNow()}
          >
            Buy now
          </button>
          <button
            type="button"
            className="btn product-icon-btn"
            onClick={() => void wishlist()}
            disabled={!wishlistStore?.ready || wishlistBusy}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={saved}
            title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          ><Heart size={18} fill={saved ? 'currentColor' : 'none'}/></button>
        </div>
        </div>
      )}

      {message && <p role="status" className="product-action-message">{message}</p>}
    </>
  );
}
