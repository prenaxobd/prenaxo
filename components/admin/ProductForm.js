'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import {
  Save,
  UploadCloud,
  X,
  Image as ImageIcon,
  Sparkles,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link as LinkIcon,
  ImagePlus,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Search,
  Plus,
} from 'lucide-react';

import {
  EditorContent,
  useEditor,
} from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';

import {
  TextStyle,
  Color,
} from '@tiptap/extension-text-style';

import TextAlign from '@tiptap/extension-text-align';

import styles from './ProductForm.module.css';

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm = (categories = []) => ({
  name: '',
  slug: '',
  sku: '',

  categoryId:
    categories[0]?.id || '',

  regularPrice: '',
  salePrice: '',
  costPrice: '',

  stock: 0,
  lowStock: 5,

  brand: '',
  brandId: '',
  productType: 'SINGLE',
  comboItems: [],
  variants: [],
  attributeValueIds: [],

  /*
   * SHORT DESCRIPTION
   * Small product summary.
   */
  shortDescription: '',

  /*
   * DESCRIPTION
   * Full product details.
   */
  description: '',

  active: true,
  featured: false,

  images: [],
});

/* =========================================================
   NORMALIZE PRODUCT FOR EDIT MODE
========================================================= */

function normalizeProduct(
  product,
  categories
) {
  if (!product) {
    return emptyForm(categories);
  }

  return {
    name: product.name || '',

    slug: product.slug || '',

    sku: product.sku || '',

    categoryId:
      product.categoryId ||
      product.category?.id ||
      categories[0]?.id ||
      '',

    regularPrice:
      product.regularPrice == null
        ? ''
        : String(
            product.regularPrice
          ),

    salePrice:
      product.salePrice == null
        ? ''
        : String(
            product.salePrice
          ),

    costPrice:
      product.costPrice == null
        ? ''
        : String(
            product.costPrice
          ),

    stock: Number(
      product.stock || 0
    ),

    lowStock: Number(
      product.lowStock || 5
    ),

    brand:
      product.brand || '',

    brandId:
      product.brandId ||
      product.brandRelation?.id ||
      '',

    productType: product.productType || 'SINGLE',
    comboItems: Array.isArray(product.comboItems) ? product.comboItems.map(item => ({ productId: item.includedProductId || item.productId, quantity: Number(item.quantity || 1), product: item.includedProduct || item.product || null })) : [],
    variants: Array.isArray(product.variants) ? product.variants.map((variant) => ({ id: variant.id, size: variant.size || '', color: variant.color || '', price: variant.price == null ? '' : String(variant.price), stock: Number(variant.stock || 0), sku: variant.sku || '', attributeValueIds: variant.attributeValues?.map((item) => item.attributeValueId) || [] })) : [],
    attributeValueIds: Array.isArray(product.attributeValues) ? product.attributeValues.map((item) => item.attributeValueId) : [],

    /*
     * SHORT DESCRIPTION
     * Existing database value will be loaded here.
                url: image.url,
                id: image.id,
    shortDescription:
      product.shortDescription ||
      '',

    /*
     * FULL DESCRIPTION
     * Existing database value will be loaded here.
     */
    description:
      product.description || '',

    active:
      product.active !== false,

    featured:
      product.featured === true,

    images:
      Array.isArray(
        product.images
      )
        ? product.images.map(
            (image, index) => ({
              url: image.url,
              alt:
                image.alt || '',
              sortOrder:
                image.sortOrder ??
                index,
            })
          )
        : [],
  };
}

/* =========================================================
   PRODUCT FORM
========================================================= */

export default function ProductForm({
  mode = 'create',
  product = null,
  categories = [],
  brands = [],
}) {
  const isEdit = mode === 'edit';

  const [form, setForm] =
    useState(() =>
      normalizeProduct(
        product,
        categories
      )
    );

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  const [comboSearch, setComboSearch] = useState('');
  const [comboResults, setComboResults] = useState([]);

  useEffect(() => {
    if (form.productType !== 'COMBO' || comboSearch.trim().length < 2) {
      setComboResults([]);
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/admin/products?q=${encodeURIComponent(comboSearch.trim())}`, { signal: controller.signal });
        if (response.ok) setComboResults((await response.json()).filter(item => item.id !== product?.id && item.productType !== 'COMBO'));
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') setComboResults([]);
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [comboSearch, form.productType, product?.id]);

  function addComboItem(item) {
    if (form.comboItems.some(comboItem => comboItem.productId === item.id)) return;
    update('comboItems', [...form.comboItems, { productId: item.id, quantity: 1, product: item }]);
    setComboSearch('');
    setComboResults([]);
  }

  function removeComboItem(productId) {
    update('comboItems', form.comboItems.filter(item => item.productId !== productId));
  }

  const pageTitle = isEdit
    ? 'Edit Product'
    : 'Add New Product';

  const stockStatus = useMemo(() => {
    if (form.stock <= 0) {
      return 'Out of Stock';
    }

    if (
      form.stock <=
      Number(form.lowStock || 0)
    ) {
      return 'Low Stock';
    }

    return 'In Stock';
  }, [
    form.stock,
    form.lowStock,
  ]);

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  function update(
    name,
    value
  ) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateVariant(index, name, value) {
    setForm((current) => ({ ...current, variants: current.variants.map((variant, variantIndex) => variantIndex === index ? { ...variant, [name]: value } : variant) }));
  }

  const selectedCategory = categories.find((category) => category.id === form.categoryId);
  const configuredAttributes = (selectedCategory?.attributes || [])
    .map((categoryAttribute) => categoryAttribute?.attribute)
    .filter((attribute) => attribute && attribute.active !== false)
    .map((attribute) => ({
      ...attribute,
      values: Array.isArray(attribute.values)
        ? attribute.values.filter((value) => value.active)
        : [],
    }));

  function handleCategoryChange(categoryId) {
    const category = categories.find((item) => item.id === categoryId);
    const categoryValueIds = new Set(
      (category?.attributes || []).flatMap((categoryAttribute) => (
        Array.isArray(categoryAttribute?.attribute?.values)
          ? categoryAttribute.attribute.values.map((value) => value.id)
          : []
      ))
    );
    setForm((current) => ({
      ...current,
      categoryId,
      attributeValueIds: current.attributeValueIds.filter((valueId) => categoryValueIds.has(valueId)),
    }));
  }

  function toggleAttributeValue(valueId, checked) {
    setForm((current) => ({
      ...current,
      attributeValueIds: checked
        ? [...new Set([...current.attributeValueIds, valueId])]
        : current.attributeValueIds.filter((id) => id !== valueId),
    }));
  }

  /* =======================================================
     SLUGIFY
  ======================================================= */

  function slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ''
      )
      .replace(
        /\s+/g,
        '-'
      )
      .replace(
        /-+/g,
        '-'
      );
  }

  /* =======================================================
     NAME CHANGE
  ======================================================= */

  function handleNameChange(
    value
  ) {
    setForm((current) => ({
      ...current,

      name: value,

      slug:
        current.slug &&
        isEdit
          ? current.slug
          : slugify(value),
    }));
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function submitForm(
    event
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage('');
    setError('');

    try {
      if (!form.name.trim()) {
        throw new Error(
          'Product name is required.'
        );
      }

      if (!form.categoryId) {
        throw new Error(
          'Please select a category.'
        );
      }

      if (form.regularPrice === '') {
        throw new Error('Regular price is required.');
      }

      if (form.productType === 'COMBO' && form.comboItems.length === 0) {
        throw new Error('Add at least one product to this combo.');
      }

      /*
       * SHORT DESCRIPTION
       * Saved separately from full description.
       */
      const shortDescription =
        form.shortDescription
          ?.trim() || null;

      /*
       * FULL DESCRIPTION
       * Rich HTML content from Tiptap.
       */
      const description =
        form.description || null;

      const payload = {
        name:
          form.name.trim(),

        slug:
          form.slug.trim() ||
          slugify(form.name),

        sku:
          form.sku.trim(),

        categoryId:
          form.categoryId,

        regularPrice:
          form.regularPrice === ''
            ? ''
            : Number(
                form.regularPrice
              ),

        salePrice:
          form.salePrice === ''
            ? null
            : Number(
                form.salePrice
              ),

        costPrice:
          form.costPrice === ''
            ? null
            : Number(
                form.costPrice
              ),

        stock: Number(
          form.stock || 0
        ),

        lowStock: Number(
          form.lowStock || 5
        ),

        brand:
          form.brand?.trim() ||
          null,

        brandId:
          form.brandId || null,

        /*
         * SMALL PRODUCT SUMMARY
         */
        shortDescription,

        /*
         * FULL PRODUCT DETAILS
         */
        description,

        active:
          Boolean(
            form.active
          ),

        featured:
          Boolean(
            form.featured
          ),

        productType:
          form.productType ||
          'SINGLE',

        ...(form.productType === 'COMBO'
          ? {
              comboItems:
                form.comboItems.map(
                  (item) => ({
                    productId:
                      item.productId,
                    quantity:
                      Number(
                        item.quantity
                      ),
                  })
                ),
            }
          : {}),

        variants: form.variants.map((variant) => ({
          ...(variant.id ? { id: variant.id } : {}),
          size: variant.size?.trim() || null,
          color: variant.color?.trim() || null,
          price: variant.price === '' ? null : Number(variant.price),
          stock: Number(variant.stock || 0),
          sku: variant.sku.trim(),
          attributeValueIds: variant.attributeValueIds,
        })),

        attributeValueIds: form.attributeValueIds,

        images:
          form.images.map(
            (
              image,
              index
            ) => ({
              ...(image.id
                ? { id: image.id }
                : {}),
              url: image.url,

              alt:
                image.alt ||
                null,

              sortOrder:
                index,
            })
          ),
      };

      const response =
        await fetch(
          '/api/admin/products',
          {
            method: isEdit
              ? 'PATCH'
              : 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              isEdit
                ? {
                    id:
                      product.id,
                    ...payload,
                  }
                : payload
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to save product.'
        );
      }

      /* =================================================
         EDIT SUCCESS
      ================================================= */

      if (isEdit) {
        setMessage(
          'Product updated successfully.'
        );

        setTimeout(() => {
          window.location.href =
            '/admin/products';
        }, 500);
      }

      /* =================================================
         CREATE SUCCESS
      ================================================= */

      else {
        setMessage(
          'Product created successfully.'
        );

        setForm(
          emptyForm(
            categories
          )
        );
      }
    } catch (err) {
      setError(
        err?.message ||
          'Something went wrong.'
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  async function handleFiles(
    event
  ) {
    const files =
      Array.from(
        event.target.files ||
          []
      );

    const allowed =
      files.filter(
        (file) =>
          [
            'image/jpeg',
            'image/png',
            'image/webp',
          ].includes(
            file.type
          )
      );

    const maxSize =
      5 * 1024 * 1024;

    const valid =
      allowed.filter(
        (file) =>
          file.size <=
          maxSize
      );

    try {
      const newImages = [];

      for (const file of valid.slice(0, Math.max(0, 8 - form.images.length))) {
        const body = new FormData();
        body.append('file', file);
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Image upload failed.');
        }

        newImages.push({
          url: data.url,
          alt: form.name || '',
          sortOrder: 0,
        });
      }

      setForm((current) => ({
        ...current,
        images: [...current.images, ...newImages].slice(0, 8),
      }));
    } catch (uploadError) {
      setError(uploadError.message || 'Image upload failed.');
    }

    event.target.value = '';
  }

  /* =======================================================
     REMOVE IMAGE
  ======================================================= */

  function removeImage(
    index
  ) {
    setForm(
      (current) => ({
        ...current,

        images:
          current.images.filter(
            (
              _,
              imageIndex
            ) =>
              imageIndex !==
              index
          ),
      })
    );
  }

  /* =======================================================
     MOVE IMAGE
  ======================================================= */

  function moveImage(
    index,
    direction
  ) {
    setForm(
      (current) => {
        const images = [
          ...current.images,
        ];

        const target =
          direction ===
          'left'
            ? index - 1
            : index + 1;

        if (
          target < 0 ||
          target >=
            images.length
        ) {
          return current;
        }

        [
          images[index],
          images[target],
        ] = [
          images[target],
          images[index],
        ];

        return {
          ...current,
          images,
        };
      }
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={
        styles.page
      }
    >
      <form
        onSubmit={
          submitForm
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className={
            styles.header
          }
        >
          <div>
            <div
              className={
                styles.eyebrow
              }
            >
              CATALOGUE
            </div>

            <h1>
              {pageTitle}
            </h1>

            <div
              className={
                styles.breadcrumb
              }
            >
              <Link href="/admin">
                Dashboard
              </Link>

              <span>›</span>

              <Link href="/admin/products">
                Products
              </Link>

              <span>›</span>

              <span>
                {isEdit
                  ? 'Edit'
                  : 'Add New'}
              </span>
            </div>
          </div>

          <div
            className={
              styles.headerActions
            }
          >
            <Link
              href={
                isEdit &&
                product?.id
                  ? `/admin/products/${product.id}`
                  : '/admin/products'
              }
              className={
                styles.cancelButton
              }
            >
              Cancel
            </Link>

            <button
              type="submit"
              className={
                styles.saveButton
              }
              disabled={saving}
            >
              <Save
                size={16}
              />

              {saving
                ? 'Saving...'
                : 'Save Product'}
            </button>
          </div>
        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {(message ||
          error) && (
          <div
            className={
              error
                ? styles.errorMessage
                : styles.successMessage
            }
          >
            {error ||
              message}
          </div>
        )}

        <div
          className={
            styles.layout
          }
        >
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div
            className={
              styles.leftColumn
            }
          >
            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <section
              className={
                styles.card
              }
            >
              <SectionTitle>
                Product Information
              </SectionTitle>

              <div
                className={
                  styles.formGrid
                }
              >
                <Field
                  label="Product Name"
                  required
                  className={
                    styles.twoThird
                  }
                >
                  <input
                    value={
                      form.name
                    }
                    onChange={(
                      event
                    ) =>
                      handleNameChange(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter product name"
                  />
                </Field>

                <Field
                  label="SKU"
                  help="Optional"
                >
                  <input
                    value={
                      form.sku
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        'sku',
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Leave empty for auto SKU"
                  />
                </Field>

                <Field
                  label="Slug"
                  className={
                    styles.twoThird
                  }
                >
                  <input
                    value={
                      form.slug
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        'slug',
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="product-slug"
                  />
                </Field>

                {/* =================================================
                    SHORT DESCRIPTION
                    আলাদা field
                ================================================= */}

                <Field
                  label="Short Description"
                  help="Short product summary"
                  className={
                    styles.fullWidth
                  }
                >
                  <textarea
                    value={
                      form.shortDescription
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        'shortDescription',
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Write a short description of this product..."
                    rows={4}
                  />
                </Field>
              </div>

              {/* =================================================
                  FULL DESCRIPTION
                  Rich text editor
              ================================================= */}

              <div
                className={
                  styles.descriptionField
                }
              >
                <div
                  className={
                    styles.fieldLabel
                  }
                >
                  Description
                </div>

                <div
                  className={
                    styles.descriptionHelp
                  }
                >
                  Full product details,
                  features,
                  specifications and
                  other information.
                </div>

                <RichTextEditor
                  value={
                    form.description
                  }
                  onChange={(
                    value
                  ) =>
                    update(
                      'description',
                      value
                    )
                  }
                />
              </div>
            </section>

            {/* =================================================
                PRICING & STOCK
            ================================================= */}

            <section
              className={
                styles.card
              }
            >
              <SectionTitle>
                Pricing & Stock
              </SectionTitle>

              <div
                className={
                  styles.formGridThree
                }
              >
                <Field
                  label="Regular Price"
                  required
                >
                  <PriceInput
                    value={
                      form.regularPrice
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'regularPrice',
                        value
                      )
                    }
                  />
                </Field>

                <Field
                  label="Sale Price"
                  help="Optional"
                >
                  <PriceInput
                    value={
                      form.salePrice
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'salePrice',
                        value
                      )
                    }
                  />
                </Field>

                <Field
                  label="Cost Price"
                  help="Optional"
                >
                  <PriceInput
                    value={
                      form.costPrice
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        'costPrice',
                        value
                      )
                    }
                  />
                </Field>
              </div>

              <div
                className={
                  styles.formGridThree
                }
              >
                <Field
                  label="Stock"
                  required
                >
                  <input
                    type="number"
                    min="0"
                    value={
                      form.stock
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        'stock',
                        Number(
                          event
                            .target
                            .value
                        )
                      )
                    }
                    placeholder="Enter stock quantity"
                  />
                </Field>

                <Field label="Low Stock Threshold">
                  <input
                    type="number"
                    min="0"
                    value={
                      form.lowStock
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        'lowStock',
                        Number(
                          event
                            .target
                            .value
                        )
                      )
                    }
                    placeholder="5"
                  />
                </Field>

                <Field label="Stock Status">
                  <div
                    className={`${styles.stockPreview} ${
                      stockStatus ===
                      'Out of Stock'
                        ? styles.stockOut
                        : stockStatus ===
                          'Low Stock'
                        ? styles.stockLow
                        : styles.stockGood
                    }`}
                  >
                    {
                      stockStatus
                    }
                  </div>
                </Field>
              </div>
            </section>

            {/* =================================================
                PRODUCT ATTRIBUTES
            ================================================= */}

            <section className={styles.card}>
              <SectionTitle>Product Options</SectionTitle>
              <p className={styles.cardDescription}>Select available values for this product from the attributes configured for its category.</p>

              {configuredAttributes.length > 0 && configuredAttributes.map((attribute) => <Field key={attribute.id} label={`${attribute.name} (optional)`} className={styles.fullWidth}>
                <div className={styles.attributeOptions}>
                  {attribute.values.map((value) => <label className={styles.attributeOption} key={value.id}>
                    <input className={styles.attributeOptionInput} type="checkbox" checked={form.attributeValueIds.includes(value.id)} onChange={(event) => toggleAttributeValue(value.id, event.target.checked)} />
                    <span className={styles.attributeOptionMark} aria-hidden="true" />
                    <span>{value.name}</span>
                  </label>)}
                </div>
              </Field>)}

              {configuredAttributes.length === 0 && <p className={styles.cardDescription}>This category has no configured product attributes.</p>}

            </section>

            <section
              className={
                styles.card
              }
            >
              <SectionTitle>
                Product Attributes
              </SectionTitle>

              <div
                className={
                  styles.formGridThree
                }
              >
                <Field label="Weight (kg)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </Field>

                <Field label="Dimensions (L × W × H) (cm)">
                  <div
                    className={
                      styles.dimensions
                    }
                  >
                    <input placeholder="Length" />
                    <input placeholder="Width" />
                    <input placeholder="Height" />
                  </div>
                </Field>

                <Field label="Unit">
                  <select
                    defaultValue=""
                  >
                    <option value="">
                      Select Unit
                    </option>

                    <option value="kg">
                      Kg
                    </option>

                    <option value="g">
                      Gram
                    </option>

                    <option value="pcs">
                      Pieces
                    </option>

                    <option value="box">
                      Box
                    </option>
                  </select>
                </Field>
              </div>
            </section>

            {/* =================================================
                SEO
            ================================================= */}

            <section
              className={
                styles.card
              }
            >
              <SectionTitle
                icon={
                  <Sparkles
                    size={15}
                  />
                }
              >
                SEO Settings
              </SectionTitle>

              <div
                className={
                  styles.seoNotice
                }
              >
                <Sparkles
                  size={17}
                />

                <div>
                  <strong>
                    Advanced SEO Ready
                  </strong>

                  <span>
                    Product SEO editor can
                    be connected to
                    ProductSEO next.
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div
            className={
              styles.rightColumn
            }
          >
            {/* =================================================
                PRODUCT IMAGES
            ================================================= */}

            <section
              className={
                styles.card
              }
            >
              <SectionTitle>
                Product Images
              </SectionTitle>

              <p
                className={
                  styles.cardDescription
                }
              >
                Upload high quality
                images for your
                product.
              </p>

              <label
                className={
                  styles.uploadArea
                }
              >
                <UploadCloud
                  size={35}
                />

                <strong>
                  Drag & drop your
                  file here, or
                </strong>

                <span>
                  Browse Files
                </span>

                <small>
                  JPG, PNG, WEBP /
                  Max 5MB
                </small>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={
                    handleFiles
                  }
                />
              </label>

              <div
                className={
                  styles.galleryHeader
                }
              >
                <span>
                  Image Gallery
                </span>

                <small>
                  Max 8 images
                </small>
              </div>

              <div
                className={
                  styles.gallery
                }
              >
                {form.images.map(
                  (
                    image,
                    index
                  ) => (
                    <div
                      className={
                        styles.imageItem
                      }
                      key={`${image.url}-${index}`}
                    >
                      <img
                        src={
                          image.url
                        }
                        alt={
                          image.alt ||
                          form.name
                        }
                      />

                      {index ===
                        0 && (
                        <span
                          className={
                            styles.primaryLabel
                          }
                        >
                          Primary
                        </span>
                      )}

                      <button
                        type="button"
                        className={
                          styles.removeImage
                        }
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                      >
                        <X
                          size={13}
                        />
                      </button>

                      <div
                        className={
                          styles.imageControls
                        }
                      >
                        <button
                          type="button"
                          disabled={
                            index ===
                            0
                          }
                          onClick={() =>
                            moveImage(
                              index,
                              'left'
                            )
                          }
                        >
                          ←
                        </button>

                        <button
                          type="button"
                          disabled={
                            index ===
                            form
                              .images
                              .length -
                              1
                          }
                          onClick={() =>
                            moveImage(
                              index,
                              'right'
                            )
                          }
                        >
                          →
                        </button>
                      </div>
                    </div>
                  )
                )}

                {Array.from({
                  length:
                    Math.max(
                      0,
                      8 -
                        form
                          .images
                          .length
                    ),
                }).map(
                  (
                    _,
                    index
                  ) => (
                    <label
                      key={`empty-${index}`}
                      className={
                        styles.emptyImage
                      }
                    >
                      <ImageIcon
                        size={18}
                      />

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        onChange={
                          handleFiles
                        }
                      />
                    </label>
                  )
                )}
              </div>
            </section>

            {/* =================================================
                ORGANIZATION
            ================================================= */}

            <section
              className={
                styles.card
              }
            >
              <SectionTitle>
                Organization
              </SectionTitle>

              <Field
                label="Category"
                required
              >
                <select
                  value={
                    form.categoryId
                  }
                  onChange={(
                    event
                  ) =>
                    handleCategoryChange(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (
                      category
                    ) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Brand">
                <select
                  value={
                    form.brandId
                  }
                  onChange={(
                    event
                  ) => {
                    const brandId = event.target.value;
                    const selectedBrand = brands.find(
                      (brand) => brand.id === brandId
                    );

                    setForm((current) => ({
                      ...current,
                      brandId,
                      brand: selectedBrand?.name || '',
                    }));
                  }
                  }
                >
                  <option value="">
                    Select Brand
                  </option>

                  {brands.map(
                    (brand) => (
                      <option
                        key={
                          brand.id
                        }
                        value={
                          brand.id
                        }
                      >
                        {
                          brand.name
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Product Type">
                <div className={styles.typeOptions}>
                  <label><input type="radio" name="productType" checked={form.productType === 'SINGLE'} onChange={() => update('productType', 'SINGLE')} /> Single Product</label>
                  <label><input type="radio" name="productType" checked={form.productType === 'COMBO'} onChange={() => update('productType', 'COMBO')} /> Combo / Bundle Product</label>
                </div>
              </Field>

              {form.productType === 'COMBO' && (
                <div className={styles.comboSection}>
                  <div className={styles.fieldLabel}>Combo / Bundle Products</div>
                  <div className={styles.comboSearch}>
                    <Search size={16} />
                    <input value={comboSearch} onChange={event => setComboSearch(event.target.value)} placeholder="Search products..." />
                  </div>
                  {comboResults.length > 0 && <div className={styles.comboResults}>{comboResults.map(item => <button type="button" key={item.id} onClick={() => addComboItem(item)}><span>{item.images?.[0]?.url && <img src={item.images[0].url} alt="" />}</span><span>{item.name}<small>{item.sku}</small></span><Plus size={15} /></button>)}</div>}
                  <div className={styles.comboItems}>{form.comboItems.map(item => <div className={styles.comboItem} key={item.productId}><span>{item.product?.images?.[0]?.url && <img src={item.product.images[0].url} alt="" />}</span><strong>{item.product?.name || item.productId}</strong><input type="number" min="1" value={item.quantity} onChange={event => update('comboItems', form.comboItems.map(current => current.productId === item.productId ? { ...current, quantity: Math.max(1, Number(event.target.value) || 1) } : current))} /><button type="button" onClick={() => removeComboItem(item.productId)} aria-label="Remove combo product"><X size={15} /></button></div>)}</div>
                </div>
              )}
            </section>

            {/* =================================================
                PRODUCT STATUS
            ================================================= */}

            <section
              className={
                styles.card
              }
            >
              <SectionTitle>
                Product Status
              </SectionTitle>

              <div
                className={
                  styles.statusGroup
                }
              >
                <span>
                  Status
                </span>

                <div
                  className={
                    styles.statusButtons
                  }
                >
                  <button
                    type="button"
                    className={
                      form.active
                        ? styles.statusActive
                        : ''
                    }
                    onClick={() =>
                      update(
                        'active',
                        true
                      )
                    }
                  >
                    Active
                  </button>

                  <button
                    type="button"
                    className={
                      !form.active
                        ? styles.statusInactive
                        : ''
                    }
                    onClick={() =>
                      update(
                        'active',
                        false
                      )
                    }
                  >
                    Inactive
                  </button>
                </div>
              </div>

              <div
                className={
                  styles.featuredRow
                }
              >
                <div>
                  <strong>
                    Featured Product
                  </strong>

                  <span>
                    Show this product in
                    featured sections.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    form.featured
                      ? styles.switchOn
                      : styles.switch
                  }
                  onClick={() =>
                    update(
                      'featured',
                      !form.featured
                    )
                  }
                >
                  <span />
                </button>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   PRICE INPUT
========================================================= */

function PriceInput({
  value,
  onChange,
}) {
  return (
    <div
      className={
        styles.priceInput
      }
    >
      <span>৳</span>

      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        placeholder="0.00"
      />
    </div>
  );
}

/* =========================================================
   RICH TEXT EDITOR
========================================================= */

function RichTextEditor({
  value,
  onChange,
}) {
  const editor =
    useEditor({
      immediatelyRender:
        false,

      extensions: [
        StarterKit.configure({
          heading: {
            levels: [
              1,
              2,
              3,
            ],
          },
        }),

        Underline,

        TextStyle,

        Color,

        TextAlign.configure({
          types: [
            'heading',
            'paragraph',
          ],
        }),

        LinkExtension.configure({
          openOnClick:
            false,

          autolink: true,

          linkOnPaste:
            true,

          HTMLAttributes: {
            target:
              '_blank',

            rel:
              'noopener noreferrer',
          },
        }),

        ImageExtension.configure({
          inline: false,

          allowBase64:
            false,
        }),
      ],

      content:
        value || '',

      editorProps: {
        attributes: {
          class:
            styles.richEditorContent,

          spellcheck:
            'true',
        },
      },

      onUpdate: ({
        editor,
      }) => {
        onChange(
          editor.getHTML()
        );
      },
    });

  if (!editor) {
    return (
      <div
        className={
          styles.richEditorLoading
        }
      >
        Loading editor...
      </div>
    );
  }

  /* =======================================================
     LINK
  ======================================================= */

  function setLink() {
    const currentUrl =
      editor.getAttributes(
        'link'
      ).href || '';

    const url =
      window.prompt(
        'Enter URL',
        currentUrl
      );

    if (url === null) {
      return;
    }

    if (!url.trim()) {
      editor
        .chain()
        .focus()
        .unsetLink()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange(
        'link'
      )
      .setLink({
        href:
          url.trim(),
      })
      .run();
  }

  /* =======================================================
     IMAGE BY URL
  ======================================================= */

  function addImage() {
    const url =
      window.prompt(
        'Enter image URL'
      );

    if (!url?.trim()) {
      return;
    }

    editor
      .chain()
      .focus()
      .setImage({
        src:
          url.trim(),
      })
      .run();
  }

  /* =======================================================
     COLOR
  ======================================================= */

  function handleColor(
    event
  ) {
    editor
      .chain()
      .focus()
      .setColor(
        event.target.value
      )
      .run();
  }

  function clearColor() {
    editor
      .chain()
      .focus()
      .unsetColor()
      .run();
  }

  return (
    <div
      className={
        styles.richEditor
      }
    >
      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div
        className={
          styles.editorToolbar
        }
      >
        <select
          className={
            styles.toolbarSelect
          }
          value={
            editor.isActive(
              'heading',
              {
                level: 1,
              }
            )
              ? 'h1'
              : editor.isActive(
                  'heading',
                  {
                    level: 2,
                  }
                )
              ? 'h2'
              : editor.isActive(
                  'heading',
                  {
                    level: 3,
                  }
                )
              ? 'h3'
              : 'paragraph'
          }
          onChange={(
            event
          ) => {
            const value =
              event.target
                .value;

            if (
              value ===
              'paragraph'
            ) {
              editor
                .chain()
                .focus()
                .setParagraph()
                .run();
            }

            if (
              value ===
              'h1'
            ) {
              editor
                .chain()
                .focus()
                .setHeading({
                  level: 1,
                })
                .run();
            }

            if (
              value ===
              'h2'
            ) {
              editor
                .chain()
                .focus()
                .setHeading({
                  level: 2,
                })
                .run();
            }

            if (
              value ===
              'h3'
            ) {
              editor
                .chain()
                .focus()
                .setHeading({
                  level: 3,
                })
                .run();
            }
          }}
        >
          <option value="paragraph">
            Paragraph
          </option>

          <option value="h1">
            Heading 1
          </option>

          <option value="h2">
            Heading 2
          </option>

          <option value="h3">
            Heading 3
          </option>
        </select>

        <ToolbarButton
          title="Bold"
          active={editor.isActive(
            'bold'
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
        >
          <Bold
            size={15}
          />
        </ToolbarButton>

        <ToolbarButton
          title="Italic"
          active={editor.isActive(
            'italic'
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
        >
          <Italic
            size={15}
          />
        </ToolbarButton>

        <ToolbarButton
          title="Underline"
          active={editor.isActive(
            'underline'
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleUnderline()
              .run()
          }
        >
          <UnderlineIcon
            size={15}
          />
        </ToolbarButton>

        <ToolbarDivider />

        <label
          className={
            styles.colorPicker
          }
          title="Text Color"
        >
          <span>A</span>

          <input
            type="color"
            value={
              editor.getAttributes(
                'textStyle'
              ).color ||
              '#222222'
            }
            onChange={
              handleColor
            }
          />
        </label>

        <button
          type="button"
          title="Remove Text Color"
          className={
            styles.colorReset
          }
          onClick={
            clearColor
          }
        >
          A
        </button>

        <ToolbarDivider />

        <ToolbarButton
          title="Bullet List"
          active={editor.isActive(
            'bulletList'
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
        >
          <List
            size={16}
          />
        </ToolbarButton>

        <ToolbarButton
          title="Numbered List"
          active={editor.isActive(
            'orderedList'
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
        >
          <ListOrdered
            size={16}
          />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="Align Left"
          active={editor.isActive({
            textAlign:
              'left',
          })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign(
                'left'
              )
              .run()
          }
        >
          <AlignLeft
            size={15}
          />
        </ToolbarButton>

        <ToolbarButton
          title="Align Center"
          active={editor.isActive({
            textAlign:
              'center',
          })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign(
                'center'
              )
              .run()
          }
        >
          <AlignCenter
            size={15}
          />
        </ToolbarButton>

        <ToolbarButton
          title="Align Right"
          active={editor.isActive({
            textAlign:
              'right',
          })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign(
                'right'
              )
              .run()
          }
        >
          <AlignRight
            size={15}
          />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="Blockquote"
          active={editor.isActive(
            'blockquote'
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBlockquote()
              .run()
          }
        >
          <Quote
            size={15}
          />
        </ToolbarButton>

        <ToolbarButton
          title="Code Block"
          active={editor.isActive(
            'codeBlock'
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleCodeBlock()
              .run()
          }
        >
          <Code2
            size={15}
          />
        </ToolbarButton>

        <ToolbarButton
          title="Add Link"
          active={editor.isActive(
            'link'
          )}
          onClick={
            setLink
          }
        >
          <LinkIcon
            size={15}
          />
        </ToolbarButton>

        <ToolbarButton
          title="Add Image by URL"
          onClick={
            addImage
          }
        >
          <ImagePlus
            size={15}
          />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="Undo"
          onClick={() =>
            editor
              .chain()
              .focus()
              .undo()
              .run()
          }
        >
          <Undo2
            size={15}
          />
        </ToolbarButton>

        <ToolbarButton
          title="Redo"
          onClick={() =>
            editor
              .chain()
              .focus()
              .redo()
              .run()
          }
        >
          <Redo2
            size={15}
          />
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
      />
    </div>
  );
}

/* =========================================================
   TOOLBAR BUTTON
========================================================= */

function ToolbarButton({
  children,
  title,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      title={title}
      className={`${
        styles.toolbarButton
      } ${
        active
          ? styles.toolbarActive
          : ''
      }`}
      onClick={
        onClick
      }
    >
      {children}
    </button>
  );
}

/* =========================================================
   TOOLBAR DIVIDER
========================================================= */

function ToolbarDivider() {
  return (
    <span
      className={
        styles.toolbarDivider
      }
    />
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  children,
  icon = null,
}) {
  return (
    <div
      className={
        styles.sectionTitle
      }
    >
      <span />

      <h2>
        {children}
      </h2>

      {icon && (
        <div
          className={
            styles.titleIcon
          }
        >
          {icon}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  required = false,
  help = '',
  children,
  className = '',
}) {
  return (
    <label
      className={`${styles.field} ${className}`}
    >
      <span>
        {label}

        {required && (
          <b>*</b>
        )}

        {help && (
          <small>
            {help}
          </small>
        )}
      </span>

      {children}
    </label>
  );
}

