'use client';

import Link from 'next/link';
import {
  ChevronDown,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
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

const PRODUCTS_PER_PAGE = 12;


/* =========================================================
   SHOP BROWSER
========================================================= */

export default function ShopBrowser({ products = [], brands: availableBrands = [] }) {

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

  const [filtersOpen, setFiltersOpen] =
    useState(false);

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

    return Array.from(
      new Set(
        products
          .map(
            product =>
              product.category?.name
          )
          .filter(Boolean)
      )
    ).sort();

  }, [products]);


  /* =======================================================
     BRANDS
  ======================================================= */

  const brands = useMemo(() => availableBrands, [availableBrands]);


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
      .filter(product =>
        brand === 'all' ||
        product.brandRelation?.name === brand
      )

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

        if (sort === 'price-low') {

          return (
            Number(
              first.salePrice ||
              first.regularPrice ||
              0
            ) -

            Number(
              second.salePrice ||
              second.regularPrice ||
              0
            )
          );

        }


        if (sort === 'price-high') {

          return (
            Number(
              second.salePrice ||
              second.regularPrice ||
              0
            ) -

            Number(
              first.salePrice ||
              first.regularPrice ||
              0
            )
          );

        }


        /* NEWEST */

        return (
          new Date(second.createdAt) -
          new Date(first.createdAt)
        );

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

          <Link href="/">
            Home
          </Link>

          <span>/</span>

          <strong>
            Shop
          </strong>

        </nav>


        {/* =================================================
            HEADING
        ================================================= */}

        <header className="shop-heading">

          <div>

            <p className="shop-kicker">
              The Prenaxo collection
            </p>

            <h1>
              Prenaxo - Online Shopping
            </h1>

            <p>
              Find practical essentials,
              thoughtful gifts, and everyday
              favourites in one easy-to-browse
              collection.
            </p>

          </div>


          <span className="shop-result-pill">

            {filteredProducts.length}

            {' '}

            {filteredProducts.length === 1
              ? 'result'
              : 'results'}

          </span>

        </header>


        {/* =================================================
            MOBILE ACTIONS
        ================================================= */}

        <div className="shop-mobile-actions">

          <button
            type="button"
            onClick={() =>
              setFiltersOpen(true)
            }
          >

            <SlidersHorizontal
              size={16}
            />

            Filters

          </button>


          <label>

            <span>
              Sort
            </span>

            <select
              value={sort}
              onChange={event =>
                setSort(
                  event.target.value
                )
              }
              aria-label="Sort products"
            >

              <option value="newest">
                Newest
              </option>

              <option value="price-low">
                Price low to high
              </option>

              <option value="price-high">
                Price high to low
              </option>

            </select>

            <ChevronDown
              size={15}
            />

          </label>

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

              <span>

                Showing{' '}

                {showingStart}

                -

                {showingEnd}

                {' '}of{' '}

                {filteredProducts.length}

                {' '}products

              </span>


              <label>

                <span>
                  Sort by
                </span>

                <select
                  value={sort}
                  onChange={event =>
                    setSort(
                      event.target.value
                    )
                  }
                  aria-label="Sort products"
                >

                  <option value="newest">
                    Newest
                  </option>

                  <option value="price-low">
                    Price low to high
                  </option>

                  <option value="price-high">
                    Price high to low
                  </option>

                </select>

                <ChevronDown
                  size={15}
                />

              </label>

            </div>


            {/* =================================================
                PRODUCTS
            ================================================= */}

            {paginatedProducts.length > 0 ? (

              <>

                <div className="shop-grid">

                  {paginatedProducts.map(
                    product => (

                      <ProductCard
                        key={product.id}
                        product={product}
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
      >


        {/* =================================================
            FILTER HEADER
        ================================================= */}

        <div className="shop-filter-head">

          <h2>
            Filters
          </h2>

          <button
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

