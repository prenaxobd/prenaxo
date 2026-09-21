'use client';
import OptimizedImage from '@/components/OptimizedImage';

import Link from 'next/link';
import {
  ArrowLeft,
  Edit3,
  Star,
  Package,
  Tag,
  Layers,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  CalendarDays,
} from 'lucide-react';

import styles from './ProductView.module.css';

export default function ProductView({
  product,
}) {
  const primaryImage =
    product.images?.[0]?.url ||
    '';

  const stockStatus =
    product.stock === 0
      ? 'Out of Stock'
      : product.stock <=
        product.lowStock
      ? 'Low Stock'
      : 'In Stock';

  const price =
    product.salePrice ??
    product.regularPrice ??
    0;

  const averageRating =
    product.reviews?.length
      ? (
          product.reviews.reduce(
            (sum, review) =>
              sum +
              Number(review.rating || 0),
            0
          ) /
          product.reviews.length
        ).toFixed(1)
      : '0.0';

  const attributeGroups = Object.values(
    (product.attributeValues || []).reduce(
      (groups, item) => {
        const attribute = item.attributeValue?.attribute;
        const key = attribute?.id || 'options';

        if (!groups[key]) {
          groups[key] = {
            name: attribute?.name || 'Options',
            values: [],
          };
        }

        if (item.attributeValue?.name) {
          groups[key].values.push(item.attributeValue.name);
        }

        return groups;
      },
      {}
    )
  );

  return (
    <div className={styles.page}>
      {/* HEADER */}

      <div className={styles.header}>
        <div>
          <Link
            href="/admin/products"
            className={
              styles.backLink
            }
          >
            <ArrowLeft size={15} />
            Back to Products
          </Link>

          <div
            className={
              styles.eyebrow
            }
          >
            PRODUCT DETAILS
          </div>

          <h1>{product.name}</h1>

          <div
            className={
              styles.breadcrumb
            }
          >
            Dashboard
            <span>›</span>
            Products
            <span>›</span>
            {product.name}
          </div>
        </div>

        <div
          className={
            styles.headerActions
          }
        >
          <Link
            href={`/admin/products/${product.id}/edit`}
            className={
              styles.editButton
            }
          >
            <Edit3 size={15} />
            Edit Product
          </Link>
        </div>
      </div>

      <div className={styles.grid}>
        {/* IMAGE CARD */}

        <section
          className={styles.imageCard}
        >
          <div
            className={
              styles.mainImage
            }
          >
            {primaryImage ? (
              <OptimizedImage
                src={primaryImage}
                alt={product.name}
              />
            ) : (
              <Package size={50} />
            )}
          </div>

          {product.images?.length >
            0 && (
            <div
              className={
                styles.thumbnails
              }
            >
              {product.images.map(
                (image) => (
                  <div
                    key={image.id}
                    className={
                      styles.thumb
                    }
                  >
                    <OptimizedImage
                      src={image.url}
                      alt={
                        image.alt ||
                        product.name
                      }
                    />
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* BASIC INFO */}

        <section
          className={styles.infoCard}
        >
          <div
            className={
              styles.statusRow
            }
          >
            <span
              className={
                product.active
                  ? styles.activeBadge
                  : styles.inactiveBadge
              }
            >
              {product.active
                ? 'Active'
                : 'Inactive'}
            </span>

            <span
              className={
                styles.stockBadge
              }
            >
              {stockStatus}
            </span>

            {product.featured && (
              <span
                className={
                  styles.featuredBadge
                }
              >
                <Star
                  size={12}
                  fill="currentColor"
                />
                Featured
              </span>
            )}
          </div>

          <h2>
            {product.name}
          </h2>

          <p
            className={
              styles.shortDescription
            }
          >
            {product.shortDescription ||
              'No short description available.'}
          </p>

          <div
            className={
              styles.priceBlock
            }
          >
            <span>
              ৳
              {Number(
                price
              ).toLocaleString(
                'en-BD'
              )}
            </span>

            {product.salePrice &&
              product.regularPrice &&
              Number(
                product.salePrice
              ) <
                Number(
                  product.regularPrice
                ) && (
                <del>
                  ৳
                  {Number(
                    product.regularPrice
                  ).toLocaleString(
                    'en-BD'
                  )}
                </del>
              )}
          </div>

          <div
            className={
              styles.stats
            }
          >
            <InfoItem
              icon={<Tag size={16} />}
              label="SKU"
              value={
                product.sku ||
                'Auto generated'
              }
            />

            <InfoItem
              icon={
                <Layers size={16} />
              }
              label="Category"
              value={
                product.category
                  ?.name || '—'
              }
            />

            <InfoItem
              icon={
                <Package size={16} />
              }
              label="Stock"
              value={String(
                product.stock
              )}
            />

            <InfoItem
              icon={
                <Star size={16} />
              }
              label="Rating"
              value={`${averageRating} / 5`}
            />
          </div>
        </section>

        {/* VARIANTS */}

        <section className={styles.fullCard}>
          <div className={styles.sectionTitle}>
            <span />
            <SlidersHorizontal size={15} />
            Options &amp; Variants
            <small className={styles.sectionMeta}>
              {product.variants?.length || 0} configured variants
            </small>
          </div>

          {attributeGroups.length > 0 && (
            <div className={styles.attributeSummary}>
              {attributeGroups.map((group) => (
                <div className={styles.attributeGroup} key={group.name}>
                  <strong>{group.name}</strong>
                  <div className={styles.optionChips}>
                    {[...new Set(group.values)].map((value) => (
                      <span className={styles.optionChip} key={value}>
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {product.variants?.length > 0 ? (
            <div className={styles.variantGrid}>
              {product.variants.map((variant, index) => {
                const relationLabels = (variant.attributeValues || [])
                  .map((item) => {
                    const name = item.attributeValue?.name;
                    const attribute = item.attributeValue?.attribute?.name;
                    return name ? `${attribute || 'Option'}: ${name}` : null;
                  })
                  .filter(Boolean);
                const legacyLabels = [
                  variant.color ? `Color: ${variant.color}` : null,
                  variant.size ? `Size: ${variant.size}` : null,
                ].filter(Boolean);
                const labels = relationLabels.length > 0 ? relationLabels : legacyLabels;

                return (
                  <div className={styles.variantCard} key={variant.id}>
                    <div className={styles.variantHeading}>
                      <strong>Variant {String(index + 1).padStart(2, '0')}</strong>
                      <span className={variant.stock > 0 ? styles.variantInStock : styles.variantOutStock}>
                        {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className={styles.optionChips}>
                      {labels.length > 0 ? labels.map((label) => (
                        <span className={styles.optionChip} key={label}>{label}</span>
                      )) : <span className={styles.mutedChip}>Base product</span>}
                    </div>
                    <div className={styles.variantFooter}>
                      <span>SKU {variant.sku || '—'}</span>
                      <strong>৳{Number(variant.price ?? price).toLocaleString('en-BD')}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyVariants}>No separate variants configured for this product.</div>
          )}
        </section>

        {/* DESCRIPTION */}

        <section
          className={
            styles.fullCard
          }
        >
          <div
            className={
              styles.sectionTitle
            }
          >
            <span />
            Product Description
          </div>

          <div
            className={
              styles.description
            }
          >
            {product.description ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: product.description,
                }}
              />
            ) : (
              <span>
                No product description
                available.
              </span>
            )}
          </div>
        </section>

        {/* ORGANIZATION */}

        <section
          className={styles.card}
        >
          <div
            className={
              styles.sectionTitle
            }
          >
            <span />
            Organization
          </div>

          <div
            className={
              styles.detailRows
            }
          >
            <DetailRow
              label="Category"
              value={
                product.category
                  ?.name || '—'
              }
            />

            <DetailRow
              label="Brand"
              value={
                product.brandRelation
                  ?.name ||
                product.brand ||
                '—'
              }
            />

            <DetailRow
              label="Low Stock Threshold"
              value={
                product.lowStock
              }
            />

            <DetailRow
              label="Product ID"
              value={
                product.id
              }
            />
          </div>
        </section>

        {/* STATUS */}

        <section
          className={styles.card}
        >
          <div
            className={
              styles.sectionTitle
            }
          >
            <span />
            Product Status
          </div>

          <div
            className={
              styles.detailRows
            }
          >
            <DetailRow
              label="Store Status"
              value={
                product.active
                  ? 'Active'
                  : 'Inactive'
              }
              icon={
                product.active ? (
                  <CheckCircle2
                    size={14}
                  />
                ) : (
                  <XCircle
                    size={14}
                  />
                )
              }
            />

            <DetailRow
              label="Featured"
              value={
                product.featured
                  ? 'Yes'
                  : 'No'
              }
            />

            <DetailRow
              label="Created"
              value={new Date(
                product.createdAt
              ).toLocaleDateString(
                'en-GB',
                {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }
              )}
            />

            <DetailRow
              label="Last Updated"
              value={new Date(
                product.updatedAt
              ).toLocaleDateString(
                'en-GB',
                {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div
      className={
        styles.infoItem
      }
    >
      <div>
        {icon}
      </div>

      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon,
}) {
  return (
    <div
      className={
        styles.detailRow
      }
    >
      <span>{label}</span>

      <strong>
        {icon}
        {value}
      </strong>
    </div>
  );
}