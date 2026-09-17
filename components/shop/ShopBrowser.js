'use client';

import Link from 'next/link';
import {
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import ProductCard from '@/components/ProductCard';


/* =========================================================
   PRICE RANGES
========================================================= */

const priceRanges = [
  {
    label: 'Any price',
    min: '',
    max: '',
  },
  {
    label: 'Under ৳500',
    min: '',
    max: '500',
  },
  {
    label: '৳500 - ৳1,000',
    min: '500',
    max: '1000',
  },
  {
    label: 'Over ৳1,000',
    min: '1000',
    max: '',
  },
];


/* =========================================================
   PRODUCTS PER PAGE
========================================================= */

const PRODUCTS_PER_PAGE = 16;

const sortOptions = [
  {
    value: 'best-sellers',
    label: 'Best Sellers',
  },
  {
    value: 'newest',
    label: 'Newest Arrivals',
  },
  {
    value: 'price-low',
    label: 'Price: Low to High',
  },
  {
    value: 'price-high',
    label: 'Price: High to Low',
  },
  {
    value: 'top-rated',
    label: 'Top Rated',
  },
  {
    value: 'featured',
    label: 'Featured',
  },
];


/* =========================================================
   SHOP BROWSER
========================================================= */

export default function ShopBrowser({
  products = [],
  brands: availableBrands = [],
  categories: availableCategories = [],
}) {

  const [category, setCategory] = useState('all');

  const [brand, setBrand] = useState('all');

  const [priceRange, setPriceRange] =
    useState(priceRanges[0]);

  const [ratingFilter, setRatingFilter] =
    useState(0);

  const [availability, setAvailability] =
    useState('all');

  const [sort, setSort] =
    useState('newest');

  const [sortMenuOpen, setSortMenuOpen] =
    useState(false);

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const [viewMode, setViewMode] =
    useState('grid');

  const selectedSortLabel =
    sortOptions.find(
      option => option.value === sort
    )?.label || 'Best Sellers';

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !event.target.closest('.shop-toolbar-sort') &&
        sortMenuOpen
      ) {
        setSortMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sortMenuOpen]);

  useEffect(() => {
    if (!filtersOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setFiltersOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [filtersOpen]);

  const [currentPage, setCurrentPage] =
    useState(1);

  useEffect(() => {
    const requestedBrand = new URLSearchParams(window.location.search).get('brand');
    if (requestedBrand) setBrand(requestedBrand);
  }, []);


  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {

    const namesFromCategories = Array.isArray(availableCategories)
      ? availableCategories
          .map((item) => item?.name)
          .filter(Boolean)
      : [];

    const namesFromProducts = Array.isArray(products)
      ? products
          .map((product) => product.category?.name)
          .filter(Boolean)
      : [];

    return Array.from(
      new Set([
        ...namesFromCategories,
        ...namesFromProducts,
      ])
    ).sort((a, b) => a.localeCompare(b));

  }, [availableCategories, products]);


  /* =======================================================
     BRANDS
  ======================================================= */

  const brands = useMemo(() => {

    const byKey = new Map();

    const registerBrand = (rawName) => {
      if (!rawName || typeof rawName !== 'string') return;

      const normalized = rawName.trim();
      if (!normalized) return;

      const key = normalized.toLowerCase();
      if (!byKey.has(key)) {
        byKey.set(key, {
          id: normalized,
          name: normalized,
        });
      }
    };

    for (const brandItem of availableBrands || []) {
      if (!brandItem?.name) continue;
      registerBrand(brandItem.name);
    }

    for (const product of products || []) {
      const productBrandName = product?.brandRelation?.name || product?.brand;
      registerBrand(productBrandName);
    }

    return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [availableBrands, products]);


  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredProducts = useMemo(() => {

    return products

      /* CATEGORY */
      .filter(product =>
        category === 'all' ||
        product.category?.name === category
      )

      /* BRAND */
      .filter(product => {
        if (brand === 'all') return true;

        const productBrandName = (product.brandRelation?.name || product.brand || '').trim();
        return productBrandName.toLowerCase() === brand.toLowerCase();
      })

      /* PRICE */
      .filter(product => {

        const price = Number(
          product.salePrice ||
          product.regularPrice ||
          0
        );

        return (
          (!priceRange.min ||
            price >= Number(priceRange.min)) &&

          (!priceRange.max ||
            price < Number(priceRange.max))
        );

      })

      /* RATING */
      .filter(product => {

        if (ratingFilter === 0) {
          return true;
        }

        const rating = Number(
          product.rating || 0
        );

        return rating >= ratingFilter;

      })

      /* AVAILABILITY */
      .filter(product => {

        if (availability === 'all') {
          return true;
        }

        if (availability === 'in-stock') {
          return Number(product.stock || 0) > 0;
        }

        if (availability === 'out-of-stock') {
          return Number(product.stock || 0) < 1;
        }

        return true;

      })

      /* SORT */
      .sort((first, second) => {

        const firstPrice = Number(
          first.salePrice ||
          first.regularPrice ||
          0
        );

        const secondPrice = Number(
          second.salePrice ||
          second.regularPrice ||
          0
        );

        const firstRating = Number(
          first.rating || 0
        );

        const secondRating = Number(
          second.rating || 0
        );

        const firstReviewCount = Number(
          first.reviewCount || 0
        );

        const secondReviewCount = Number(
          second.reviewCount || 0
        );

        const firstPopularity =
          firstReviewCount * 12 +
          firstRating * 10 +
          Number(first.featured ? 30 : 0);

        const secondPopularity =
          secondReviewCount * 12 +
          secondRating * 10 +
          Number(second.featured ? 30 : 0);

        if (sort === 'best-sellers') {
          return secondPopularity - firstPopularity ||
            secondRating - firstRating ||
            new Date(second.createdAt) - new Date(first.createdAt);
        }

        if (sort === 'price-low') {
          return firstPrice - secondPrice ||
            new Date(second.createdAt) - new Date(first.createdAt);
        }

        if (sort === 'price-high') {
          return secondPrice - firstPrice ||
            new Date(second.createdAt) - new Date(first.createdAt);
        }

        if (sort === 'top-rated') {
          return secondRating - firstRating ||
            secondReviewCount - firstReviewCount ||
            new Date(second.createdAt) - new Date(first.createdAt);
        }

        if (sort === 'featured') {
          return Number(second.featured) - Number(first.featured) ||
            secondRating - firstRating ||
            new Date(second.createdAt) - new Date(first.createdAt);
        }

        /* NEWEST */
        return new Date(second.createdAt) - new Date(first.createdAt);
      });

  }, [
    products,
    category,
    brand,
    priceRange,
    ratingFilter,
    availability,
    sort,
  ]);


  /* =======================================================
     TOTAL PAGES
  ======================================================= */

  const totalPages = Math.ceil(
    filteredProducts.length /
    PRODUCTS_PER_PAGE
  );


  /* =======================================================
     RESET PAGE WHEN FILTER CHANGES
  ======================================================= */

  useEffect(() => {

    setCurrentPage(1);

  }, [
    category,
    brand,
    priceRange,
    ratingFilter,
    availability,
    sort,
  ]);


  /* =======================================================
     MAKE SURE PAGE IS VALID
  ======================================================= */

  useEffect(() => {

    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {

      setCurrentPage(totalPages);

    }

  }, [
    currentPage,
    totalPages,
  ]);


  /* =======================================================
     PAGINATION
  ======================================================= */

  const startIndex =
    (currentPage - 1) *
    PRODUCTS_PER_PAGE;

  const endIndex =
    startIndex +
    PRODUCTS_PER_PAGE;

  const paginatedProducts =
    filteredProducts.slice(
      startIndex,
      endIndex
    );


  /* =======================================================
     SHOWING RANGE
  ======================================================= */

  const showingStart =
    filteredProducts.length > 0
      ? startIndex + 1
      : 0;

  const showingEnd =
    Math.min(
      endIndex,
      filteredProducts.length
    );


  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  function clearFilters() {

    setCategory('all');

    setBrand('all');

    setPriceRange(
      priceRanges[0]
    );

    setRatingFilter(0);

    setAvailability('all');

    setCurrentPage(1);

  }


  /* =======================================================
     PAGE CHANGE
  ======================================================= */

  function goToPage(page) {

    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

  }


  /* =======================================================
     PAGE NUMBERS
  ======================================================= */

  function getPageNumbers() {

    const pages = [];

    /*
     * Small number of pages:
     * 1 2 3 4 5
     */

    if (totalPages <= 7) {

      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {

        pages.push(i);

      }

      return pages;

    }


    /*
     * Beginning:
     * 1 2 3 4 ... 10
     */

    if (currentPage <= 4) {

      return [
        1,
        2,
        3,
        4,
        '...',
        totalPages,
      ];

    }


    /*
     * End:
     * 1 ... 7 8 9 10
     */

    if (
      currentPage >=
      totalPages - 3
    ) {

      return [
        1,
        '...',
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];

    }


    /*
     * Middle:
     * 1 ... 4 5 6 ... 10
     */

    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ];

  }


  return (

    <main className="shop-page">

      <div className="container shop-page-inner">


        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <nav
          className="shop-breadcrumb"
          aria-label="Breadcrumb"
        >

          <span className="shop-breadcrumb-item">
            Home
          </span>

          <span className="shop-breadcrumb-separator">
            /
          </span>

          <span className="shop-breadcrumb-current">
            Shop All
          </span>

        </nav>


        {/* =================================================
            HEADING
        ================================================= */}

        <header className="shop-heading">

          <h1>
            Shop All
          </h1>

          <span className="shop-result-pill">

            {filteredProducts.length}
            {' '}
            products
            {' • '}
            Page {currentPage} of {Math.max(totalPages, 1)}

          </span>

        </header>


        {/* =================================================
            MOBILE ACTIONS
        ================================================= */}

        <div className="shop-mobile-actions">

          <button
            type="button"
            className="shop-mobile-filter-button"
            onClick={() =>
              setFiltersOpen(true)
            }
            aria-label="Open product filters"
            title="Filters"
          >
            <SlidersHorizontal size={17} strokeWidth={1.7} aria-hidden="true" />
          </button>

          <div className={`shop-toolbar-sort shop-mobile-sort-wrap ${sortMenuOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="shop-sort-trigger"
              onClick={() => setSortMenuOpen(currentValue => !currentValue)}
              aria-haspopup="listbox"
              aria-expanded={sortMenuOpen}
              aria-label="Sort products"
            >
              <ArrowUpDown className="shop-sort-control-icon" size={14} strokeWidth={1.7} aria-hidden="true" />
              <span className="shop-sort-value">{selectedSortLabel}</span>
              <span className="shop-sort-icon">
                <ChevronDown size={14} />
              </span>
            </button>

            {sortMenuOpen && (
              <div className="shop-sort-menu" role="listbox" aria-label="Sort options">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`shop-sort-option ${sort === option.value ? 'is-selected' : ''}`}
                    onClick={() => {
                      setSort(option.value);
                      setSortMenuOpen(false);
                    }}
                    aria-selected={sort === option.value}
                  >
                    <span>{option.label}</span>
                    {sort === option.value && <span className="shop-sort-dot" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="shop-mobile-view-toggle" aria-label="Choose product view">
            <button
              type="button"
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>

            <button
              type="button"
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="10" y1="6" x2="21" y2="6"></line>
                <line x1="10" y1="12" x2="21" y2="12"></line>
                <line x1="10" y1="18" x2="21" y2="18"></line>
                <circle cx="4" cy="6" r="1" fill="currentColor"></circle>
                <circle cx="4" cy="12" r="1" fill="currentColor"></circle>
                <circle cx="4" cy="18" r="1" fill="currentColor"></circle>
              </svg>
            </button>
          </div>

        </div>


        {/* =================================================
            SHOP LAYOUT
        ================================================= */}

        <div className="shop-layout">


          {/* =================================================
              FILTER PANEL
          ================================================= */}

          <FilterPanel

            categories={categories}

            brands={brands}

            category={category}
            setCategory={setCategory}

            brand={brand}
            setBrand={setBrand}

            priceRange={priceRange}
            setPriceRange={setPriceRange}

            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}

            availability={availability}
            setAvailability={setAvailability}

            sort={sort}
            setSort={setSort}

            clearFilters={clearFilters}

            mobile={filtersOpen}

            close={() =>
              setFiltersOpen(false)
            }

          />


          {/* =================================================
              RESULTS
          ================================================= */}

          <section
            className="shop-results"
            aria-label="Product results"
          >


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="shop-toolbar">

              <div className={`shop-toolbar-sort ${sortMenuOpen ? 'is-open' : ''}`}>

                <button
                  type="button"
                  className="shop-sort-trigger"
                  onClick={() =>
                    setSortMenuOpen(
                      currentValue => !currentValue
                    )
                  }
                  aria-haspopup="listbox"
                  aria-expanded={sortMenuOpen}
                  aria-label="Sort products"
                >
                  <span className="shop-sort-label">Sort by</span>

                  <span className="shop-sort-value">
                    {selectedSortLabel}
                  </span>

                  <span className="shop-sort-icon">
                    <ChevronDown size={16} />
                  </span>
                </button>

                {sortMenuOpen && (
                  <div className="shop-sort-menu" role="listbox" aria-label="Sort options">
                    {sortOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`shop-sort-option ${sort === option.value ? 'is-selected' : ''}`}
                        onClick={() => {
                          setSort(option.value);
                          setSortMenuOpen(false);
                        }}
                        aria-selected={sort === option.value}
                      >
                        <span>{option.label}</span>
                        {sort === option.value && <span className="shop-sort-dot" aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                )}

              </div>

              <div className="shop-view-toggle" aria-label="Choose product view">

                <button
                  type="button"
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={18} />
                </button>

                <button
                  type="button"
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="10" y1="6" x2="21" y2="6"></line>
                    <line x1="10" y1="12" x2="21" y2="12"></line>
                    <line x1="10" y1="18" x2="21" y2="18"></line>
                    <circle cx="4" cy="6" r="1" fill="currentColor"></circle>
                    <circle cx="4" cy="12" r="1" fill="currentColor"></circle>
                    <circle cx="4" cy="18" r="1" fill="currentColor"></circle>
                  </svg>
                </button>

              </div>

            </div>


            {/* =================================================
                PRODUCTS
            ================================================= */}

            {paginatedProducts.length > 0 ? (

              <>

                <div className={`shop-grid ${viewMode === 'list' ? 'list-view' : ''}`}>

                  {paginatedProducts.map(
                    product => (

                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                      />

                    )
                  )}

                </div>


                {/* =================================================
                    PAGINATION
                ================================================= */}

                {totalPages > 1 && (

                  <nav
                    className="shop-pagination"
                    aria-label="Product pagination"
                  >


                    {/* PREVIOUS */}

                    <button
                      type="button"
                      className="pagination-prev"
                      onClick={() =>
                        goToPage(
                          currentPage - 1
                        )
                      }
                      disabled={
                        currentPage === 1
                      }
                      aria-label="Previous page"
                    >

                      <ChevronLeft
                        size={17}
                      />

                      <span>
                        Prev
                      </span>

                    </button>


                    {/* PAGE NUMBERS */}

                    <div className="pagination-pages">

                      {getPageNumbers().map(
                        (page, index) => {

                          if (
                            page === '...'
                          ) {

                            return (

                              <span
                                key={`dots-${index}`}
                                className="pagination-dots"
                              >
                                ...
                              </span>

                            );

                          }


                          return (

                            <button
                              key={page}
                              type="button"
                              className={
                                currentPage === page
                                  ? 'active'
                                  : ''
                              }
                              onClick={() =>
                                goToPage(page)
                              }
                              aria-current={
                                currentPage === page
                                  ? 'page'
                                  : undefined
                              }
                            >

                              {page}

                            </button>

                          );

                        }
                      )}

                    </div>


                    {/* NEXT */}

                    <button
                      type="button"
                      className="pagination-next"
                      onClick={() =>
                        goToPage(
                          currentPage + 1
                        )
                      }
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      aria-label="Next page"
                    >

                      <span>
                        Next
                      </span>

                      <ChevronRight
                        size={17}
                      />

                    </button>

                  </nav>

                )}

              </>

            ) : (

              /* =================================================
                 NO RESULTS
              ================================================= */

              <div className="shop-no-results">

                <h2>
                  No products match
                  these filters
                </h2>

                <p>
                  Try clearing a filter
                  to see more of the
                  Prenaxo collection.
                </p>

                <button
                  className="btn"
                  type="button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>

              </div>

            )}

          </section>

        </div>

      </div>

    </main>

  );

}


/* =========================================================
   FILTER PANEL
========================================================= */

function FilterPanel({

  categories,

  brands,

  category,
  setCategory,

  brand,
  setBrand,

  priceRange,
  setPriceRange,

  ratingFilter,
  setRatingFilter,

  availability,
  setAvailability,

  sort,
  setSort,

  clearFilters,

  mobile,

  close,

}) {

  return (

    <>

      {/* MOBILE BACKDROP */}

      {mobile && (

        <button
          className="shop-filter-backdrop"
          type="button"
          aria-label="Close filters"
          onClick={close}
        />

      )}


      <aside
        className={`shop-filters ${
          mobile ? 'is-open' : ''
        }`}
        aria-label="Product filters"
      >


        {/* =================================================
            FILTER HEADER
        ================================================= */}

        <div className="shop-filter-head">

          <h2>
            Filters
          </h2>

          <button
            className="shop-filter-close"
            type="button"
            aria-label="Close filters"
            onClick={close}
          >
            <X size={19} />
          </button>

        </div>


        {/* =================================================
            CATEGORY
        ================================================= */}

        <FilterSection
          title="Categories"
        >

          <FilterRadio
            label="All categories"
            checked={
              category === 'all'
            }
            onChange={() =>
              setCategory('all')
            }
          />

          {categories.map(item => (

            <FilterRadio
              key={item}
              label={item}
              checked={
                category === item
              }
              onChange={() =>
                setCategory(item)
              }
            />

          ))}

        </FilterSection>


        {/* =================================================
            BRAND
        ================================================= */}

        {brands.length > 0 && (

          <FilterSection
            title="Brand"
          >

            <FilterRadio
              label="All brands"
              checked={
                brand === 'all'
              }
              onChange={() =>
                setBrand('all')
              }
            />

            {brands.map(item => (

              <FilterRadio
                key={item.id}
                label={item.name}
                checked={
                  brand === item.name
                }
                onChange={() =>
                  setBrand(item.name)
                }
              />

            ))}

          </FilterSection>

        )}


        {/* =================================================
            PRICE
        ================================================= */}

        <FilterSection
          title="Price range"
        >

          {priceRanges.map(item => (

            <FilterRadio
              key={item.label}
              label={item.label}
              checked={
                priceRange.label ===
                item.label
              }
              onChange={() =>
                setPriceRange(item)
              }
            />

          ))}

        </FilterSection>


        {/* =================================================
            RATING
        ================================================= */}

        <FilterSection
          title="Rating"
        >

          <FilterRadio
            label="All ratings"
            checked={
              ratingFilter === 0
            }
            onChange={() =>
              setRatingFilter(0)
            }
          />

          <FilterRadio
            label="★★★★★ & up"
            checked={
              ratingFilter === 5
            }
            onChange={() =>
              setRatingFilter(5)
            }
          />

          <FilterRadio
            label="★★★★ & up"
            checked={
              ratingFilter === 4
            }
            onChange={() =>
              setRatingFilter(4)
            }
          />

          <FilterRadio
            label="★★★ & up"
            checked={
              ratingFilter === 3
            }
            onChange={() =>
              setRatingFilter(3)
            }
          />

          <FilterRadio
            label="★★ & up"
            checked={
              ratingFilter === 2
            }
            onChange={() =>
              setRatingFilter(2)
            }
          />

          <FilterRadio
            label="★ & up"
            checked={
              ratingFilter === 1
            }
            onChange={() =>
              setRatingFilter(1)
            }
          />

        </FilterSection>


        {/* =================================================
            AVAILABILITY
        ================================================= */}

        <FilterSection
          title="Availability"
        >

          <FilterRadio
            label="All products"
            checked={
              availability === 'all'
            }
            onChange={() =>
              setAvailability('all')
            }
          />

          <FilterRadio
            label="In stock"
            checked={
              availability ===
              'in-stock'
            }
            onChange={() =>
              setAvailability(
                'in-stock'
              )
            }
          />

          <FilterRadio
            label="Out of stock"
            checked={
              availability ===
              'out-of-stock'
            }
            onChange={() =>
              setAvailability(
                'out-of-stock'
              )
            }
          />

        </FilterSection>

        {mobile && (
          <div className="shop-filter-actions">
            <button
              type="button"
              className="shop-filter-clear-btn"
              onClick={() => {
                clearFilters();
                close();
              }}
            >
              Clear All
            </button>

            <button
              type="button"
              className="shop-filter-apply-btn"
              onClick={() => close()}
            >
              Apply Filters
            </button>
          </div>
        )}

      </aside>

    </>

  );

}


/* =========================================================
   FILTER SECTION
========================================================= */

function FilterSection({
  title,
  children,
}) {

  return (

    <section
      className="shop-filter-section"
    >

      <h3>
        {title}
      </h3>

      <div>
        {children}
      </div>

    </section>

  );

}


/* =========================================================
   FILTER RADIO
========================================================= */

function FilterRadio({
  label,
  checked,
  onChange,
  disabled = false,
}) {

  return (

    <label
      className={`shop-filter-radio ${
        disabled
          ? 'is-disabled'
          : ''
      }`}
    >

      <input
        type="radio"
        checked={Boolean(checked)}
        onChange={onChange}
        disabled={disabled}
      />

      <span>
        {label}
      </span>

    </label>

  );

}

