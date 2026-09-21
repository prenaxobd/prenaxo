'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Clock3, Filter, Gift, Heart, Percent, ShieldCheck, Truck, Zap } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import FlashSaleCountdown from './FlashSaleCountdown';

const PAGE_SIZE = 8;
function RadioOption({ checked, label, count, onChange }) {
  return <button type="button" className={`flash-radio-option ${checked ? 'active' : ''}`} onClick={onChange}><span className="flash-radio" aria-hidden="true" />{label}{count !== undefined && <small>{count}</small>}</button>;
}

export default function FlashSalePage({ products = [] }) {
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const [rating, setRating] = useState(0);
  const maxPrice = useMemo(() => Math.max(1000, ...products.map((product) => Number(product.salePrice || product.regularPrice || 0))), [products]);
  const [priceLimit, setPriceLimit] = useState(maxPrice);
  const [availability, setAvailability] = useState('all');
  const [sort, setSort] = useState('popular');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);
  useEffect(() => {
    if (!sortMenuOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!event.target.closest('.flash-sort-control')) setSortMenuOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [sortMenuOpen]);
  const categories = useMemo(() => [...new Set(products.map(product => product.category?.name).filter(Boolean))].sort(), [products]);
  const brands = useMemo(() => [...new Set(products.map(product => product.brandRelation?.name).filter(Boolean))].sort(), [products]);
  const ratings = useMemo(() => [5, 4, 3, 2, 1].filter(value => products.some(product => Number(product.rating || 0) >= value)), [products]);
  const filteredProducts = useMemo(() => {
    return [...products].filter(product => {
      const price = Number(product.salePrice || product.regularPrice || 0);
      const inStock = Number(product.stock || 0) > 0;
      return (category === 'all' || product.category?.name === category) && (brand === 'all' || product.brandRelation?.name === brand) && (rating === 0 || Number(product.rating || 0) >= rating) && (availability === 'all' || (availability === 'in' ? inStock : !inStock)) && price <= priceLimit;
    }).sort((first, second) => {
      const firstPrice = Number(first.salePrice || first.regularPrice || 0);
      const secondPrice = Number(second.salePrice || second.regularPrice || 0);
      if (sort === 'price-low') return firstPrice - secondPrice;
      if (sort === 'price-high') return secondPrice - firstPrice;
      if (sort === 'top-rated') return Number(second.rating || 0) - Number(first.rating || 0);
      if (sort === 'discount') return (Number(second.regularPrice || 0) - secondPrice) - (Number(first.regularPrice || 0) - firstPrice);
      if (sort === 'newest') return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
      return Number(second.stock || 0) - Number(first.stock || 0);
    });
  }, [products, category, brand, rating, priceLimit, availability, sort]);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const visibleProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetFilters = () => { setCategory('all'); setBrand('all'); setRating(0); setPriceLimit(maxPrice); setAvailability('all'); setPage(1); };
  const maxStock = Math.max(1, ...products.map((product) => Number(product.stock || 0)));
    const sortOptions = [
      ['popular', 'Most popular'],
      ['newest', 'Newest arrivals'],
      ['price-low', 'Price: low to high'],
      ['price-high', 'Price: high to low'],
      ['discount', 'Biggest discount'],
    ];
    const selectedSort = sortOptions.find(([value]) => value === sort)?.[1] || sortOptions[0][1];
    return <main className="flash-sale-page"><div className="container">
      <section className="flash-hero"><div className="flash-hero-copy"><span className="flash-kicker"><Zap size={15} /> LIMITED TIME OFFER</span><h1>Flash <strong>Sale</strong></h1><p>Grab your favorite products at unbeatable prices!<br />Limited time. Limited stock. Don&apos;t miss out!</p><div className="flash-hero-features"><span><Percent /> <b>Up to 50% Off</b><small>Big savings</small></span><span><Clock3 /> <b>Limited Stock</b><small>Grab fast</small></span><span><ShieldCheck /> <b>Top Brands</b><small>Trusted quality</small></span></div><Link href="#flash-products" className="flash-hero-cta">Shop Flash Deals <ChevronRight size={17} /></Link></div><div className="flash-hero-countdown"><FlashSaleCountdown /></div></section>
      <section className="flash-offer-strip"><div className="flash-benefits"><div><Clock3 /><span><b>Limited-time offer</b><small>Shop before it ends</small></span></div><div><Percent /><span><b>Selected products</b><small>Best prices today</small></span></div><div><Zap /><span><b>Fast checkout</b><small>Stock is limited</small></span></div></div></section>
      <section id="flash-products" className="flash-content">
        {mobileFilters && <button className="flash-filter-backdrop" type="button" aria-label="Close filters" onClick={() => setMobileFilters(false)} />}
        <aside className={`flash-sidebar ${mobileFilters ? 'is-open' : ''}`}>
          <div className="flash-filter-heading"><h2>Filters</h2><button type="button" onClick={() => setMobileFilters(false)} aria-label="Close filters">×</button></div>
          <div className="flash-filter-title"><h2>Filters</h2><button type="button" onClick={resetFilters}>Clear all</button></div>
          <h3>Categories</h3><div className="flash-radio-list"><RadioOption checked={category === 'all'} label="All categories" count={products.length} onChange={() => { setCategory('all'); setPage(1); }} />{categories.map(item => <RadioOption key={item} checked={category === item} label={item} count={products.filter(product => product.category?.name === item).length} onChange={() => { setCategory(item); setPage(1); }} />)}</div>
          <h3>Brand</h3><div className="flash-radio-list"><RadioOption checked={brand === 'all'} label="All brands" onChange={() => { setBrand('all'); setPage(1); }} />{brands.map(item => <RadioOption key={item} checked={brand === item} label={item} onChange={() => { setBrand(item); setPage(1); }} />)}</div>
          <section className="flash-price-section"><h3>Price Range</h3><div className="flash-price-control"><input type="range" min="0" max={maxPrice} value={priceLimit} onChange={(event) => { setPriceLimit(Number(event.target.value)); setPage(1); }} aria-label="Maximum flash sale price" /><div className="flash-price-values"><span>৳0</span><span>৳{priceLimit.toLocaleString('en-BD')}</span></div></div></section>
          <h3>Rating</h3><div className="flash-radio-list"><RadioOption checked={rating === 0} label="All ratings" onChange={() => { setRating(0); setPage(1); }} />{ratings.map(value => <RadioOption key={value} checked={rating === value} label={`${'★'.repeat(value)} & up`} count={products.filter(product => Number(product.rating || 0) >= value).length} onChange={() => { setRating(value); setPage(1); }} />)}</div>
          <h3>Availability</h3><div className="flash-radio-list"><RadioOption checked={availability === 'all'} label="All products" onChange={() => { setAvailability('all'); setPage(1); }} /><RadioOption checked={availability === 'in'} label="In stock" count={products.filter(product => Number(product.stock || 0) > 0).length} onChange={() => { setAvailability('in'); setPage(1); }} /><RadioOption checked={availability === 'out'} label="Out of stock" count={products.filter(product => Number(product.stock || 0) < 1).length} onChange={() => { setAvailability('out'); setPage(1); }} /></div>
        </aside>
        <div className="flash-product-area"><div className="flash-products-heading"><div><button className="flash-mobile-filter" type="button" onClick={() => setMobileFilters(true)}><Filter size={16} /> Filters</button><span className="flash-eyebrow">Special offers</span><h2>Flash Sale Products</h2><p>{filteredProducts.length} products found</p></div><div className={`flash-sort-control ${sortMenuOpen ? 'is-open' : ''}`}><button type="button" className="flash-sort-trigger" onClick={() => setSortMenuOpen(open => !open)} aria-haspopup="listbox" aria-expanded={sortMenuOpen}><span>Sort by</span><strong>{selectedSort}</strong><ChevronDown size={15} /></button>{sortMenuOpen && <div className="flash-sort-menu" role="listbox" aria-label="Sort flash sale products">{sortOptions.map(([value, label]) => <button key={value} type="button" role="option" className={sort === value ? 'is-selected' : ''} onClick={() => { setSort(value); setSortMenuOpen(false); setPage(1); }} aria-selected={sort === value}><span>{label}</span>{sort === value && <i aria-hidden="true" />}</button>)}</div>}</div></div>{visibleProducts.length ? <div className="flash-product-grid">{visibleProducts.map(product => <ProductCard key={product.id} product={product} flashSale maxStock={maxStock} />)}</div> : <div className="flash-empty">No sale products match these filters.</div>}<div className="flash-pagination"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /> Prev</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button type="button" className={page === number ? 'active' : ''} key={number} onClick={() => setPage(number)}>{number}</button>)}<button type="button" disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next <ChevronRight size={16} /></button></div></div>
      </section>
      <section className="flash-services">{[[Truck, 'Free delivery', 'On ৳3000+ orders'], [Truck, 'Fast delivery', 'Nationwide'], [ShieldCheck, 'Secure payment', '100% protected'], [Heart, 'Easy returns', 'Within 7 days'], [Gift, 'Customer support', 'Always available']].map(([Icon, title, text]) => <div key={title}><Icon size={25} /><span><b>{title}</b><small>{text}</small></span></div>)}</section>
    </div></main>;
}
