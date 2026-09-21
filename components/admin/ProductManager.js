'use client';
import OptimizedImage from '@/components/OptimizedImage';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import {
  Search,
  Plus,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Star,
  Package,
  X,
} from 'lucide-react';

import styles from './ProductManager.module.css';

const PAGE_SIZES = [10, 20, 50];

export default function ProductManager({
  initialProducts = [],
  categories = [],
  brands = [],
}) {
  const [products, setProducts] =
    useState(initialProducts);

  const [query, setQuery] =
    useState('');

  const [category, setCategory] =
    useState('');

  const [brand, setBrand] =
    useState('');

  const [status, setStatus] =
    useState('ACTIVE');

  const [stockFilter, setStockFilter] =
    useState('ALL');

  const [sort, setSort] =
    useState('newest');

  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  const [selected, setSelected] =
    useState([]);

  const [menuId, setMenuId] =
    useState(null);

  const [loadingId, setLoadingId] =
    useState(null);

  const visibleProducts = useMemo(() => {
    const search =
      query.trim().toLowerCase();

    let result = products.filter(
      (product) => {
        const text = [
          product.name,
          product.sku,
          product.category?.name,
          product.brand,
          product.brandRelation?.name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (
          search &&
          !text.includes(search)
        ) {
          return false;
        }

        if (
          category &&
          product.categoryId !== category
        ) {
          return false;
        }

        if (
          brand &&
          product.brandRelation?.id !== brand
        ) {
          return false;
        }

        if (status === 'ACTIVE') {
          if (!product.active) {
            return false;
          }
        }

        if (status === 'ARCHIVED') {
          if (product.active) {
            return false;
          }
        }

        if (stockFilter === 'OUT') {
          if (product.stock !== 0) {
            return false;
          }
        }

        if (stockFilter === 'LOW') {
          if (
            !(
              product.stock > 0 &&
              product.stock <=
                product.lowStock
            )
          ) {
            return false;
          }
        }

        if (stockFilter === 'HEALTHY') {
          if (
            product.stock <=
            product.lowStock
          ) {
            return false;
          }
        }

        return true;
      }
    );

    result.sort((a, b) => {
      if (sort === 'name') {
        return a.name.localeCompare(
          b.name
        );
      }

      if (sort === 'stock') {
        return a.stock - b.stock;
      }

      if (sort === 'price') {
        return (
          Number(
            a.salePrice ??
              a.regularPrice ??
              0
          ) -
          Number(
            b.salePrice ??
              b.regularPrice ??
              0
          )
        );
      }

      return (
        new Date(b.createdAt) -
        new Date(a.createdAt)
      );
    });

    return result;
  }, [
    products,
    query,
    category,
    brand,
    status,
    stockFilter,
    sort,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      visibleProducts.length /
        pageSize
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const pagedProducts =
    visibleProducts.slice(
      (currentPage - 1) *
        pageSize,
      currentPage * pageSize
    );

  const allSelected =
    pagedProducts.length > 0 &&
    pagedProducts.every(
      (product) =>
        selected.includes(
          product.id
        )
    );

  function toggleSelect(id) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id
          )
        : [...current, id]
    );
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelected((current) =>
        current.filter(
          (id) =>
            !pagedProducts.some(
              (product) =>
                product.id === id
            )
        )
      );

      return;
    }

    setSelected((current) => [
      ...new Set([
        ...current,
        ...pagedProducts.map(
          (product) => product.id
        ),
      ]),
    ]);
  }

  function clearFilters() {
    setQuery('');
    setCategory('');
    setBrand('');
    setStatus('ACTIVE');
    setStockFilter('ALL');
    setSort('newest');
    setPage(1);
    setSelected([]);
  }

  async function updateProduct(
    id,
    values
  ) {
    setLoadingId(id);

    try {
      const response = await fetch(
        '/api/admin/products',
        {
          method: 'PATCH',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            id,
            ...values,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to update product.'
        );
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === id
            ? {
                ...product,
                ...data,
              }
            : product
        )
      );

      setMenuId(null);
    } catch (error) {
      alert(
        error?.message ||
          'Unable to update product.'
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function archiveProduct(
    id
  ) {
    const confirmed =
      window.confirm(
        'Archive this product?'
      );

    if (!confirmed) {
      return;
    }

    setLoadingId(id);

    try {
      const response = await fetch(
        `/api/admin/products?id=${id}`,
        {
          method: 'DELETE',
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to archive product.'
        );
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === id
            ? {
                ...product,
                active: false,
              }
            : product
        )
      );

      setMenuId(null);
    } catch (error) {
      alert(
        error?.message ||
          'Unable to archive product.'
      );
    } finally {
      setLoadingId(null);
    }
  }

  function exportProducts() {
    const rows = [
      [
        'Product',
        'SKU',
        'Category',
        'Brand',
        'Price',
        'Stock',
        'Status',
      ],

      ...visibleProducts.map(
        (product) => [
          product.name,
          product.sku || '',
          product.category?.name || '',
          product.brandRelation?.name ||
            product.brand ||
            '',
          product.salePrice ??
            product.regularPrice ??
            '',
          product.stock,
          product.active
            ? 'Active'
            : 'Archived',
        ]
      ),
    ];

    const csv = rows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? ''
              ).replaceAll(
                '"',
                '""'
              )}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob(
      [csv],
      {
        type:
          'text/csv;charset=utf-8;',
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;
    link.download =
      'prenaxo-products.csv';

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.page}>
      {/* PAGE HEADER */}

      <div className={styles.header}>
        <div>
          <div
            className={
              styles.eyebrow
            }
          >
            CATALOGUE
          </div>

          <h1>Products</h1>

          <div
            className={
              styles.breadcrumb
            }
          >
            <span>Dashboard</span>

            <b>›</b>

            <span>Products</span>
          </div>
        </div>

        <div
          className={
            styles.headerActions
          }
        >
          <Link
            href="/admin/products/new"
            className={
              styles.addButton
            }
          >
            <Plus size={16} />

            Add Product
          </Link>

          <button
            type="button"
            className={
              styles.exportButton
            }
            onClick={
              exportProducts
            }
          >
            <Download size={15} />

            Export
          </button>
        </div>
      </div>

      {/* FILTER CARD */}

      <div
        className={
          styles.filterCard
        }
      >
        <div
          className={
            styles.searchBox
          }
        >
          <Search size={17} />

          <input
            value={query}
            onChange={(event) => {
              setQuery(
                event.target.value
              );

              setPage(1);
            }}
            placeholder="Search products by name, SKU, barcode..."
          />

          {query && (
            <button
              type="button"
              onClick={() =>
                setQuery('')
              }
            >
              <X size={15} />
            </button>
          )}
        </div>

        <FilterSelect
          value={category}
          onChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
          placeholder="All Categories"
          options={categories}
        />

        <FilterSelect
          value={brand}
          onChange={(value) => {
            setBrand(value);
            setPage(1);
          }}
          placeholder="All Brands"
          options={brands}
        />

        <SimpleSelect
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={[
            ['ACTIVE', 'Active'],
            ['ALL', 'All Status'],
            ['ARCHIVED', 'Archived'],
          ]}
        />

        <SimpleSelect
          value={stockFilter}
          onChange={(value) => {
            setStockFilter(value);
            setPage(1);
          }}
          options={[
            ['ALL', 'Stock Status'],
            ['HEALTHY', 'In Stock'],
            ['LOW', 'Low Stock'],
            ['OUT', 'Out of Stock'],
          ]}
        />

        <SimpleSelect
          value={sort}
          onChange={(value) =>
            setSort(value)
          }
          options={[
            ['newest', 'Newest'],
            ['name', 'Name'],
            ['stock', 'Stock'],
            ['price', 'Price'],
          ]}
        />

        <button
          type="button"
          className={
            styles.clearButton
          }
          onClick={
            clearFilters
          }
        >
          Clear Filters
        </button>
      </div>

      {/* TABLE */}

      <div
        className={
          styles.tableCard
        }
      >
        <div
          className={
            styles.tableTopInfo
          }
        >
          <span>
            {visibleProducts.length}{' '}
            products
          </span>

          {selected.length > 0 && (
            <span>
              {selected.length}{' '}
              selected
            </span>
          )}
        </div>

        <div
          className={
            styles.tableScroll
          }
        >
          <table className="admin-data-table">
            <thead>
              <tr>
                <th
                  className={
                    styles.checkColumn
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      allSelected
                    }
                    onChange={
                      toggleSelectAll
                    }
                  />
                </th>

                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Type</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pagedProducts.map(
                (product) => {
                  const image =
                    product
                      .images?.[0]
                      ?.url;

                  const isLow =
                    product.stock >
                      0 &&
                    product.stock <=
                      product.lowStock;

                  const isOut =
                    product.stock ===
                    0;

                  return (
                    <tr
                      key={
                        product.id
                      }
                    >
                      <td
                        className={
                          styles.checkColumn
                        }
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(
                            product.id
                          )}
                          onChange={() =>
                            toggleSelect(
                              product.id
                            )
                          }
                        />
                      </td>

                      <td>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className={
                            styles.productCell
                          }
                        >
                          <div
                            className={
                              styles.thumbnail
                            }
                          >
                            {image ? (
                              <OptimizedImage
                                src={
                                  image
                                }
                                alt={
                                  product.name
                                }
                              />
                            ) : (
                              <Package
                                size={
                                  18
                                }
                              />
                            )}
                          </div>

                          <div>
                            <strong>
                              {
                                product.name
                              }
                            </strong>

                            <small>
                              ID:{' '}
                              {product.id.slice(
                                0,
                                10
                              )}
                            </small>
                          </div>
                        </Link>
                      </td>

                      <td>
                        {product.sku ||
                          '—'}
                      </td>

                      <td>
                        <span
                          className={
                            styles.categoryPill
                          }
                        >
                          {product
                            .category
                            ?.name ||
                            '—'}
                        </span>
                      </td>

                      <td>
                        {product
                          .brandRelation
                          ?.name ||
                          product.brand ||
                          '—'}
                      </td>

                      <td>
                        <span className={product.productType === 'COMBO' ? styles.statusLow : styles.categoryPill}>
                          {product.productType || 'SINGLE'}
                        </span>
                      </td>

                      <td>
                        <strong>
                          ৳
                          {Number(
                            product.salePrice ??
                              product.regularPrice ??
                              0
                          ).toLocaleString(
                            'en-BD'
                          )}
                        </strong>
                      </td>

                      <td>
                        <div
                          className={
                            styles.stockBox
                          }
                        >
                          <span
                            className={
                              isOut
                                ? styles.stockOut
                                : isLow
                                ? styles.stockLow
                                : styles.stockGood
                            }
                          >
                            {
                              product.stock
                            }
                          </span>

                          <small>
                            {isOut
                              ? 'Out of stock'
                              : isLow
                              ? 'Low stock'
                              : 'In stock'}
                          </small>
                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            product.active
                              ? styles.statusActive
                              : styles.statusArchived
                          }
                        >
                          {product.active
                            ? 'Active'
                            : 'Archived'}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={
                            product.featured
                              ? styles.starActive
                              : styles.star
                          }
                          disabled={
                            loadingId ===
                            product.id
                          }
                          onClick={() =>
                            updateProduct(
                              product.id,
                              {
                                featured:
                                  !product.featured,
                              }
                            )
                          }
                        >
                          <Star
                            size={
                              17
                            }
                            fill={
                              product.featured
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        </button>
                      </td>

                      <td>
                        <span
                          className={
                            styles.date
                          }
                        >
                          {new Date(
                            product.updatedAt
                          ).toLocaleDateString(
                            'en-GB',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </td>

                      <td>
                        <div
                          className={
                            styles.actionWrap
                          }
                        >
                          <button
                            type="button"
                            className={
                              styles.actionButton
                            }
                            onClick={() =>
                              setMenuId(
                                menuId ===
                                  product.id
                                  ? null
                                  : product.id
                              )
                            }
                          >
                            <MoreVertical
                              size={
                                17
                              }
                            />
                          </button>

                          {menuId ===
                            product.id && (
                            <div
                              className={
                                styles.actionMenu
                              }
                            >
                              <Link
                                href={`/admin/products/${product.id}`}
                                onClick={() =>
                                  setMenuId(
                                    null
                                  )
                                }
                              >
                                View
                              </Link>

                              {/* FIXED EDIT LINK */}
                              <Link
                                href={`/admin/products/new?edit=${product.id}`}
                                onClick={() =>
                                  setMenuId(
                                    null
                                  )
                                }
                              >
                                Edit
                              </Link>

                              <button
                                type="button"
                                disabled={
                                  loadingId ===
                                  product.id
                                }
                                onClick={() =>
                                  archiveProduct(
                                    product.id
                                  )
                                }
                              >
                                Archive
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}

              {!pagedProducts.length && (
                <tr>
                  <td
                    colSpan={11}
                    className={
                      styles.empty
                    }
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div
          className={
            styles.pagination
          }
        >
          <div>
            Showing{' '}
            <strong>
              {visibleProducts.length ===
              0
                ? 0
                : (currentPage - 1) *
                    pageSize +
                  1}
            </strong>{' '}
            –{' '}
            <strong>
              {Math.min(
                currentPage *
                  pageSize,
                visibleProducts.length
              )}
            </strong>{' '}
            of{' '}
            <strong>
              {
                visibleProducts.length
              }
            </strong>
          </div>

          <div
            className={
              styles.paginationControls
            }
          >
            <span>
              Rows per page
            </span>

            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(
                  Number(
                    event.target.value
                  )
                );

                setPage(1);
              }}
            >
              {PAGE_SIZES.map(
                (size) => (
                  <option
                    key={size}
                    value={size}
                  >
                    {size}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setPage(
                  currentPage - 1
                )
              }
            >
              <ChevronLeft
                size={16}
              />
            </button>

            <strong>
              {currentPage}
            </strong>

            <button
              type="button"
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setPage(
                  currentPage + 1
                )
              }
            >
              <ChevronRight
                size={16}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimpleSelect({
  value,
  onChange,
  options,
}) {
  return (
    <div
      className={
        styles.selectWrap
      }
    >
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      >
        {options.map(
          ([optionValue, label]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {label}
            </option>
          )
        )}
      </select>

      <ChevronDown size={14} />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}) {
  return (
    <div
      className={
        styles.selectWrap
      }
    >
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.name}
          </option>
        ))}
      </select>

      <ChevronDown size={14} />
    </div>
  );
}