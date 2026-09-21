'use client';

import { Heart, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/CartProvider';

function getAttributeValueIds(variant) {
  return (variant?.attributeValues || [])
    .map((item) => item.attributeValueId)
    .filter(Boolean);
}

function normalizeOptionValue(value) {
  return String(value || '').trim().toLowerCase();
}

function sameSelection(left = [], right = []) {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();

  if (a.length !== b.length) return false;

  return a.every((id, index) => id === b[index]);
}

function getVariantForSelection(variants, selectedIds, attributeGroups) {
  const selectedValues = attributeGroups.flatMap((group) =>
    group.values
      .filter((value) => selectedIds.includes(value.id))
      .map((value) => ({ attribute: group, value: value.name }))
  );

  return variants.find((variant) => {
    const variantAttributeValueIds = getAttributeValueIds(variant);

    if (variantAttributeValueIds.length > 0) {
      return selectedIds.every((id) =>
        variantAttributeValueIds.includes(id)
      );
    }

    return selectedValues.every(({ attribute, value }) => {
      const attributeKey = normalizeOptionValue(
        attribute.slug || attribute.name
      );
      const variantValue =
        variant[attributeKey] ??
        variant[attributeKey.replace(/[-_ ]/g, '')];

      return normalizeOptionValue(variantValue) ===
        normalizeOptionValue(value);
    });
  });
}

function variantHasAttributeValue(variant, attribute, value) {
  if (getAttributeValueIds(variant).includes(value.id)) {
    return true;
  }

  const attributeKey = normalizeOptionValue(
    attribute.slug || attribute.name
  );
  const variantValue =
    variant[attributeKey] ??
    variant[attributeKey.replace(/[-_ ]/g, '')];

  return normalizeOptionValue(variantValue) ===
    normalizeOptionValue(value.name);
}

export default function ProductActions({
  product,
  productId,
  disabled = false,
}) {
  const router = useRouter();
  const cartProduct = useMemo(
    () => product || { id: productId },
    [product, productId]
  );

  const variants = useMemo(
    () => (Array.isArray(cartProduct.variants) ? cartProduct.variants : []),
    [cartProduct.variants]
  );

  /*
   * ============================================
   * ATTRIBUTE GROUPS
   * ============================================
   *
   * Example:
   *
   * Color
   * White
   * Black
   *
   * Size
   * S
   * M
   * L
   * XL
   * XXL
   */

  const attributeGroups = useMemo(() => {
    return (cartProduct.category?.attributes || [])
      .map(({ attribute }) => ({
        ...attribute,

        values: (attribute.values || []).filter((value) =>
          cartProduct.attributeValues?.some(
            (item) =>
              item.attributeValueId === value.id
          )
        ),
      }))
      .filter(
        (attribute) =>
          attribute.values.length > 0
      );
  }, [cartProduct]);

  /*
   * ============================================
   * IMPORTANT
   * ============================================
   *
   * NOTHING IS SELECTED BY DEFAULT.
   *
   * Before:
   *
   * first option was automatically selected.
   *
   * Now:
   *
   * S/M/L/XL/XXL all start unselected.
   */

  const [
    selectedAttributeValueIds,
    setSelectedAttributeValueIds,
  ] = useState([]);

  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  const cart = useCart();

  /*
   * ============================================
   * TOGGLE ATTRIBUTE
   * ============================================
   *
   * Multiple selection allowed.
   *
   * Example:
   *
   * S -> selected
   * M -> selected
   * L -> selected
   *
   * Result:
   *
   * [S, M, L]
   */

  function toggleAttributeValue(
    attribute,
    valueId
  ) {
    const belongsToGroup =
      attribute.values.some(
        (value) =>
          value.id === valueId
      );

    if (!belongsToGroup) return;

    setSelectedAttributeValueIds(
      (current) => {
        const alreadySelected =
          current.includes(valueId);

        if (alreadySelected) {
          return current.filter(
            (id) => id !== valueId
          );
        }

        return [
          ...current,
          valueId,
        ];
      }
    );

    setMessage('');
  }

  /*
   * ============================================
   * SELECTED GROUPS
   * ============================================
   */

  const selectedGroups = useMemo(() => {
    return attributeGroups
      .map((attribute) => ({
        attribute,
        values: attribute.values.filter(
          (value) =>
            selectedAttributeValueIds.includes(
              value.id
            )
        ),
      }))
      .filter(
        (group) => group.values.length > 0
      );
  }, [
    attributeGroups,
    selectedAttributeValueIds,
  ]);

  /*
   * ============================================
   * CREATE COMBINATIONS
   * ============================================
   *
   * Example:
   *
   * Color:
   * White
   *
   * Size:
   * S M L
   *
   * Result:
   *
   * White + S
   * White + M
   * White + L
   *
   * = 3 products
   */

  const selectedCombinations = useMemo(() => {
    if (!selectedGroups.length) {
      return [];
    }

    /*
     * Every attribute group must
     * have at least one selection.
     */

    if (selectedGroups.length === 0) {
      return [];
    }

    let combinations = [[]];

    for (const group of selectedGroups) {
      const next = [];

      for (const combination of combinations) {
        for (const value of group.values) {
          next.push([
            ...combination,
            value.id,
          ]);
        }
      }

      combinations = next;
    }

    return combinations;
  }, [selectedGroups]);

  /*
   * ============================================
   * FIND REAL DATABASE VARIANTS
   * ============================================
   */

  const selectedVariantEntries = useMemo(() => {
    return selectedCombinations
      .map((combination) => ({
        combination,
        variant: getVariantForSelection(
          variants,
          combination,
          attributeGroups
        ),
      }));
  }, [
    selectedCombinations,
    variants,
    attributeGroups,
  ]);

  const selectedVariants = selectedVariantEntries
    .map((entry) => entry.variant)
    .filter(Boolean);

  /*
   * ============================================
   * ATTRIBUTE VARIANT CHECK
   * ============================================
   */

  const hasAttributeVariants =
    variants.some(
      (variant) =>
        getAttributeValueIds(variant).length > 0 ||
        Boolean(variant.size || variant.color)
    );

  /*
   * ============================================
   * SELECTED PRODUCT COUNT
   * ============================================
   */

  const totalSelectedProducts =
    hasAttributeVariants
      ? selectedCombinations.length
      : 1;

  /*
   * ============================================
   * STOCK CHECK
   * ============================================
   */

  const hasOutOfStockVariant =
    selectedVariants.some(
      (variant) =>
        Number(variant.stock || 0) <= 0
    );

  /*
   * If selected combinations don't have
   * matching database variants.
   */

  const selectionIncomplete =
    hasAttributeVariants &&
    selectedCombinations.length === 0;

  /*
   * ============================================
   * UNAVAILABLE
   * ============================================
   */

  const unavailable =
    disabled ||
    (
      hasAttributeVariants &&
      (
        selectionIncomplete ||
        hasOutOfStockVariant
      )
    );

  /*
   * ============================================
   * CREATE CART PRODUCT
   * ============================================
   */

  function createVariantProduct(variant, selectedIds = []) {
    const variantAttributeValueIds = variant
      ? getAttributeValueIds(variant)
      : [];
    const attributeValueIds =
      variantAttributeValueIds.length > 0
        ? variantAttributeValueIds
        : selectedIds;

    return {
      ...cartProduct,

      variantId:
        variant?.id || null,

      attributeValueIds,

      stock:
        variant?.stock ?? cartProduct.stock,

      salePrice:
        variant?.price ??
        cartProduct.salePrice,

      regularPrice:
        variant?.price ??
        cartProduct.regularPrice,
    };
  }

  /*
   * ============================================
   * ADD TO CART
   * ============================================
   *
   * VERY IMPORTANT:
   *
   * If user selects:
   *
   * S
   * M
   * L
   *
   * we call cart.add() THREE TIMES.
   *
   * So:
   *
   * S = 1
   * M = 1
   * L = 1
   *
   * Cart count = 3
   */

  async function add() {
    setMessage('');

    if (unavailable) {
      setMessage(
        'Please select available options.'
      );
      return;
    }

    try {
      /*
       * Product with variants
       */

      if (hasAttributeVariants) {
        let addedCount = 0;

        for (const { combination, variant } of selectedVariantEntries) {
          const activeProduct =
            createVariantProduct(
              variant,
              combination
            );

          const result =
            await cart.add(
              activeProduct,
              quantity
            );

          if (!result.ok) {
            setMessage(
              result.error ||
              'Unable to add item.'
            );

            return;
          }

          /*
           * Example:
           *
           * S + M + L
           * quantity = 1
           *
           * addedCount = 3
           *
           * S + M + L
           * quantity = 2
           *
           * addedCount = 6
           */

          addedCount += quantity;
        }

        setMessage(
          `${addedCount} product${
            addedCount > 1
              ? 's'
              : ''
          } added to cart`
        );

        return;
      }

      /*
       * Product without variants
       */

      const result =
        await cart.add(
          cartProduct,
          quantity
        );

      if (result.ok) {
        setMessage(
          `${quantity} product${
            quantity > 1
              ? 's'
              : ''
          } added to cart`
        );
      } else {
        setMessage(
          result.error ||
          'Unable to add item.'
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        'Unable to add item to cart.'
      );
    }
  }

  /*
   * ============================================
   * BUY NOW
   * ============================================
   */

  async function buyNow() {
    setMessage('');

    if (unavailable) {
      setMessage(
        'Please select available options.'
      );
      return;
    }

    try {
      if (hasAttributeVariants) {
        for (const { combination, variant } of selectedVariantEntries) {
          const activeProduct =
            createVariantProduct(
              variant,
              combination
            );

          const result =
            await cart.add(
              activeProduct,
              quantity
            );

          if (!result.ok) {
            setMessage(
              result.error ||
              'Unable to add item.'
            );

            return;
          }
        }
      } else {
        const result =
          await cart.add(
            cartProduct,
            quantity
          );

        if (!result.ok) {
          setMessage(
            result.error ||
            'Unable to add item.'
          );

          return;
        }
      }

      router.push('/checkout');
    } catch (error) {
      console.error(error);

      setMessage(
        'Unable to continue to checkout.'
      );
    }
  }

  /*
   * ============================================
   * WISHLIST
   * ============================================
   */

  async function wishlist() {
    try {
      const response =
        await fetch(
          '/api/wishlist',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              productId:
                cartProduct.id,
            }),
          }
        );

      const data =
        await response.json();

      setMessage(
        response.ok
          ? data.saved
            ? 'Saved to wishlist'
            : 'Removed from wishlist'
          : data.error ||
              'Please sign in'
      );
    } catch {
      setMessage(
        'Unable to update wishlist.'
      );
    }
  }

  return (
    <>
      {/* =====================================
          COLOR / SIZE / OTHER OPTIONS
      ====================================== */}

      {attributeGroups.map(
        (attribute) => (
          <fieldset
            className="product-variation"
            key={attribute.id}
          >
            <legend className="variation-title">
              {attribute.name}
            </legend>

            <div className="variation-options">
              {attribute.values.map(
                (value) => {
                  const selected =
                    selectedAttributeValueIds.includes(
                      value.id
                    );

                  /*
                   * Does this value exist
                   * inside any database variant?
                   */

                  const optionHasVariant =
                    cartProduct.attributeValues?.some(
                      (item) => item.attributeValueId === value.id
                    ) || variants.some(
                      (variant) =>
                        variantHasAttributeValue(
                          variant,
                          attribute,
                          value
                        )
                    );

                  return (
                    <button
                      type="button"
                      key={value.id}
                      className={`variation-option ${
                        selected
                          ? 'selected'
                          : ''
                      } ${
                        !optionHasVariant
                          ? 'option-unavailable'
                          : ''
                      }`}
                      onClick={() =>
                        toggleAttributeValue(
                          attribute,
                          value.id
                        )
                      }
                      aria-pressed={
                        selected
                      }
                    >
                      <span>
                        {value.name}
                      </span>

                      {selected && (
                        <span
                          className="variation-check"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </fieldset>
        )
      )}

      {/* =====================================
          SELECTED PRODUCTS
          
          This is NOT "Available Options".
          It only shows how many products
          will be added.
      ====================================== */}

      {hasAttributeVariants &&
        totalSelectedProducts > 0 && (
          <div className="selected-products-count">
            <span>
              Selected
            </span>

            <strong>
              {totalSelectedProducts}
            </strong>
          </div>
        )}

      {/* =====================================
          QUANTITY
      ====================================== */}

      <div className="product-action-controls">
        <div
          className="product-qty"
          aria-label="Quantity selector"
        >
          <button
            type="button"
            className="qty-decrement"
            onClick={() =>
              setQuantity(
                (value) =>
                  Math.max(
                    1,
                    value - 1
                  )
              )
              }
            aria-label="Decrease quantity"
          >
            −
          </button>

          <span>
            {quantity}
          </span>

          <button
            type="button"
            className="qty-increment"
            onClick={() =>
              setQuantity(
                (value) =>
                  Math.min(
                    99,
                    value + 1
                  )
              )
            }
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* =====================================
            ACTION BUTTONS
        ====================================== */}

        <div className="product-action-buttons">
          <button
            type="button"
            className="btn product-primary-btn"
            disabled={unavailable}
            onClick={add}
          >
            <ShoppingBag
              size={17}
            />

            <span>
              Add to cart
              {hasAttributeVariants &&
                totalSelectedProducts >
                  1 &&
                ` (${totalSelectedProducts})`}
            </span>
          </button>

          <button
            type="button"
            className="btn product-secondary-btn"
            disabled={unavailable}
            onClick={buyNow}
          >
            Buy now
          </button>

          <button
            type="button"
            className="btn product-icon-btn"
            onClick={wishlist}
            aria-label="Add to wishlist"
          >
            <Heart size={18} />
          </button>
        </div>
      </div>

      {/* =====================================
          MESSAGE
      ====================================== */}

      {message && (
        <p
          role="status"
          className="product-action-message"
        >
          {message}
        </p>
      )}
    </>
  );
}