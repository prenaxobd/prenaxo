'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';

import ProductCard from '@/components/ProductCard';


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
  total = 0,
  totalPages = 1,
  currentPage: serverPage = 1,
  initialFilters = {},
  brands: availableBrands = [],
  categories: availableCategories = [],
  priceBounds = { min: 0, max: 0 },
  pageTitle = 'Shop Best Quality Products Online',
  basePath = '/shop',
  lockedCategory = null,
  pageClassName = '',
  contentId,
}) {

  const router = useRouter();

  const [category, setCategory] = useState(lockedCategory || initialFilters.category || 'all');
  const [subcategory, setSubcategory] = useState(initialFilters.subcategory || 'all');
  const [search, setSearch] = useState(initialFilters.search || '');

  const [brand, setBrand] = useState(initialFilters.brand || 'all');

  const [priceRange, setPriceRange] = useState(
    initialFilters.priceRange || { min: '', max: '' }
  );

  const [ratingFilter, setRatingFilter] =
    useState(initialFilters.ratingFilter || 0);

  const [availability, setAvailability] =
    useState(initialFilters.availability || 'all');

  const [sort, setSort] =
    useState(initialFilters.sort || 'newest');

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
    useState(serverPage);
  const hasMounted = useRef(false);

  useEffect(() => {
    startTransition(() => setCurrentPage(serverPage));
  }, [serverPage]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    startTransition(() => setCurrentPage(1));
  }, [availability, brand, category, priceRange, ratingFilter, sort, subcategory]);

  useEffect(() => {
    const query = new URLSearchParams();
    if (category !== 'all' && category !== lockedCategory) query.set('category', category);
    if (subcategory !== 'all') query.set('subcategory', subcategory);
    if (search) query.set('search', search);
    if (brand !== 'all') query.set('brand', brand);
    if (priceRange.min) query.set('min', priceRange.min);
    if (priceRange.max) query.set('max', priceRange.max);
    if (ratingFilter) query.set('rating', String(ratingFilter));
    if (availability !== 'all') query.set('availability', availability);
    if (sort !== 'newest') query.set('sort', sort);
    if (currentPage > 1) query.set('page', String(currentPage));

    const nextUrl = query.toString() ? `${basePath}?${query}` : basePath;
    const timeoutId = window.setTimeout(() => {
      router.replace(nextUrl, { scroll: false });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [availability, basePath, brand, category, currentPage, lockedCategory, priceRange, ratingFilter, router, search, sort, subcategory]);


  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(
    () => (Array.isArray(availableCategories) ? availableCategories : [])
      .filter(item => item?.active !== false && !item?.parentId)
    .filter(item => !lockedCategory || item.slug === lockedCategory)
    .sort((first, second) => first.name.localeCompare(second.name)),
    [availableCategories, lockedCategory]
  );
  const selectedParentCategory = categories.find(item => item.slug === category);
  const subcategories = useMemo(
    () => selectedParentCategory
      ? availableCategories.filter(item => item.parentId === selectedParentCategory.id && item.active !== false)
      : [],
    [availableCategories, selectedParentCategory]
  );


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

    return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [availableBrands]);


  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredProducts = products;


  /* =======================================================
     MAKE SURE PAGE IS VALID
  ======================================================= */

  useEffect(() => {

    if (totalPages > 0 && currentPage > totalPages) {

      startTransition(() => setCurrentPage(totalPages));

    }

  }, [
    currentPage,
    totalPages,
  ]);


  /* =======================================================
     PAGINATION
  ======================================================= */

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts;


  /* =======================================================
     SHOWING RANGE
  ======================================================= */

  const showingStart =
    total > 0
      ? startIndex + 1
      : 0;

  const showingEnd =
    Math.min(
      endIndex,
      startIndex + paginatedProducts.length
    );


  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  function clearFilters() {

    setCategory(lockedCategory || 'all');
    setSubcategory('all');
    setSearch('');

    setBrand('all');

    setPriceRange({ min: '', max: '' });

    setRatingFilter(0);

    setAvailability('all');
    setSort('newest');

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
    const query = new URLSearchParams(window.location.search);
    query.set('page', String(page));
    router.push(`${basePath}?${query.toString()}`, { scroll: false });

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

    <main className={`shop-page ${pageClassName}`}>

      <div className="container shop-page-inner">


        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <nav
          className="shop-breadcrumb"
          aria-label="Breadcrumb"
        >

          <Link className="shop-breadcrumb-item" href="/">
            Home
          </Link>

          <span className="shop-breadcrumb-separator">
            /
          </span>

          {lockedCategory && (
            <>
              <Link className="shop-breadcrumb-item" href="/shop">Shop All</Link>
              <span className="shop-breadcrumb-separator">/</span>
              <span className="shop-breadcrumb-current">{pageTitle}</span>
            </>
          )}
          {!lockedCategory && (
            <Link className="shop-breadcrumb-current" href="/shop" aria-current="page">
              Shop All
            </Link>
          )}

        </nav>


        {/* =================================================
            HEADING
        ================================================= */}

        <header id={contentId} className="shop-heading">

          <h1>{pageTitle}</h1>

          <span className="shop-result-pill">

            {total}
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
                    role="option"
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
            allCategories={availableCategories}
            subcategories={subcategories}
            priceBounds={priceBounds}
            lockedCategory={lockedCategory}

            brands={brands}

            category={category}
            setCategory={setCategory}
            subcategory={subcategory}
            setSubcategory={setSubcategory}

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
                        role="option"
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
                        scrollReveal
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
  allCategories,
  subcategories,
  priceBounds,
  lockedCategory,

  brands,

  category,
  setCategory,
  subcategory,
  setSubcategory,

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

  const sliderMin = Number(priceBounds.min) || 0;
  const sliderMax = Math.max(Number(priceBounds.max) || 0, sliderMin + 1);
  const sliderValue = priceRange.max
    ? Math.min(Math.max(Number(priceRange.max) - 1, sliderMin), sliderMax)
    : sliderMax;
  const selectedPriceCeiling = priceRange.max
    ? Math.min(Number(priceRange.max) - 1, sliderMax)
    : sliderMax;

  const brandOptions = [
    <FilterRadio
      key="all-brands"
      label="All brands"
      checked={brand === 'all'}
      onChange={() => setBrand('all')}
    />,
    ...brands.map(item => (
      <FilterRadio
        key={item.id}
        label={item.name}
        checked={brand === item.name}
        onChange={() => setBrand(item.name)}
      />
    )),
  ];

  const categoryTree = categories.map(parent => ({
    ...parent,
    children: allCategories
      .filter(item => item.parentId === parent.id && item.active !== false)
      .sort((first, second) => first.name.localeCompare(second.name)),
  }));

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
            className="shop-filter-clear-header"
            type="button"
            onClick={clearFilters}
          >
            Clear all
          </button>

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

        {lockedCategory ? (
          subcategories.length > 0 && (
            <FilterSection title="Categories">
              <div className="shop-filter-scroll-list shop-filter-subcategories" role="group" aria-label="Filter by subcategory">
                <FilterRadio
                  label="All in this category"
                  checked={subcategory === 'all'}
                  onChange={() => setSubcategory('all')}
                />
                {subcategories.map(item => (
                  <FilterRadio
                    key={item.id}
                    label={item.name}
                    checked={subcategory === item.slug}
                    onChange={() => setSubcategory(item.slug)}
                  />
                ))}
              </div>
            </FilterSection>
          )
        ) : (
          <FilterSection title="Categories">
            <CategoryFilter
              categories={categoryTree}
              category={category}
              subcategory={subcategory}
              onSelectCategory={value => {
                setCategory(value);
                setSubcategory('all');
              }}
              onSelectSubcategory={setSubcategory}
            />
          </FilterSection>
        )}


        {/* =================================================
            BRAND
        ================================================= */}

        {brands.length > 0 && (

          <FilterSection
            title="Brand"
          >

            <div className="shop-filter-scroll-list shop-filter-brands" role="group" aria-label="Filter by brand">
              {brandOptions}
            </div>

          </FilterSection>

        )}


        {/* =================================================
            PRICE
        ================================================= */}

        <FilterSection title="Price range">
          <div className="shop-price-range-control">
            <input
              className="shop-price-range-slider"
              type="range"
              min={sliderMin}
              max={sliderMax}
              step="1"
              value={sliderValue}
              aria-label="Maximum product price"
              aria-valuetext={`Up to ৳${selectedPriceCeiling.toLocaleString('en-BD')}`}
              onChange={event => {
                const value = Number(event.target.value);
                setPriceRange({
                  min: '',
                  max: value >= sliderMax ? '' : String(value + 1),
                });
              }}
            />
            <div className="shop-price-range-values" aria-hidden="true">
              <span>৳{sliderMin.toLocaleString('en-BD')}</span>
              <span className="shop-price-range-current">Up to ৳{selectedPriceCeiling.toLocaleString('en-BD')}</span>
              <span>৳{Number(priceBounds.max || 0).toLocaleString('en-BD')}</span>
            </div>
          </div>
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

function CategoryFilter({
  categories,
  category,
  subcategory,
  onSelectCategory,
  onSelectSubcategory,
}) {
  const [openParentId, setOpenParentId] = useState(null);

  function selectParent(item) {
    onSelectCategory(item.slug);
    if (item.children.length) setOpenParentId(item.id);
    else setOpenParentId(null);
  }

  return (
    <div className="shop-filter-scroll-list shop-filter-category-list" role="group" aria-label="Filter by category">
        <button
          type="button"
          className={`shop-category-option ${category === 'all' ? 'is-selected' : ''}`}
          aria-pressed={category === 'all'}
          onClick={() => {
            onSelectCategory('all');
            setOpenParentId(null);
          }}
        >
          <span>All categories</span>
        </button>
        {categories.map(item => {
          const isSelected = category === item.slug;
          const isOpen = openParentId === item.id;

          return (
            <div
              key={item.id}
              className="shop-category-option-group"
              onMouseEnter={() => item.children.length && setOpenParentId(item.id)}
              onMouseLeave={() => setOpenParentId(current => current === item.id ? null : current)}
              onFocus={() => item.children.length && setOpenParentId(item.id)}
            >
              <button
                type="button"
                className={`shop-category-option ${isSelected ? 'is-selected' : ''} ${isOpen ? 'is-open' : ''}`}
                aria-pressed={isSelected}
                aria-haspopup={item.children.length ? 'true' : undefined}
                aria-expanded={item.children.length ? isOpen : undefined}
                onClick={() => selectParent(item)}
              >
                <span>{item.name}</span>
                {item.children.length > 0 && <ChevronRight size={15} aria-hidden="true" />}
              </button>
              {isOpen && item.children.length > 0 && (
                <div className="shop-category-submenu" aria-label={`${item.name} subcategories`}>
                  <button
                    type="button"
                    className={`shop-category-suboption ${category === item.slug && subcategory === 'all' ? 'is-selected' : ''}`}
                    aria-pressed={category === item.slug && subcategory === 'all'}
                    onClick={() => {
                      onSelectCategory(item.slug);
                      onSelectSubcategory('all');
                      setOpenParentId(null);
                    }}
                  >
                    <span>All in {item.name}</span>
                  </button>
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      type="button"
                      className={`shop-category-suboption ${category === item.slug && subcategory === child.slug ? 'is-selected' : ''}`}
                      aria-pressed={category === item.slug && subcategory === child.slug}
                      onClick={() => {
                        onSelectCategory(item.slug);
                        onSelectSubcategory(child.slug);
                        setOpenParentId(null);
                      }}
                    >
                      <span>{child.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
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
