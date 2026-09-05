'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Clock3, Filter, Gift, Heart, Percent, ShieldCheck, Truck, Zap } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

const PAGE_SIZE = 8;
const priceRanges = [
  ['all', 'Any price', 0, Infinity],
  ['under-500', 'Under ৳500', 0, 500],
  ['500-1000', '৳500 - ৳1,000', 500, 1000],
  ['over-1000', 'Over ৳1,000', 1000, Infinity],
];

function RadioOption({ checked, label, count, onChange }) {
  return <button type="button" className={`flash-radio-option ${checked ? 'active' : ''}`} onClick={onChange}><span className="flash-radio" aria-hidden="true" />{label}{count !== undefined && <small>{count}</small>}</button>;
}

export default function FlashSalePage({ products = [] }) {
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const [rating, setRating] = useState(0);
  const [priceRange, setPriceRange] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [remaining, setRemaining] = useState(24 * 60 * 60 * 1000);

  useEffect(() => { const deadline = Date.now() + 86400000; const timer = window.setInterval(() => setRemaining(Math.max(0, deadline - Date.now())), 1000); return () => window.clearInterval(timer); }, []);
  const categories = useMemo(() => [...new Set(products.map(product => product.category?.name).filter(Boolean))].sort(), [products]);
  const brands = useMemo(() => [...new Set(products.map(product => product.brandRelation?.name).filter(Boolean))].sort(), [products]);
  const ratings = useMemo(() => [5, 4, 3, 2, 1].filter(value => products.some(product => Number(product.rating || 0) >= value)), [products]);
  const filteredProducts = useMemo(() => {
    const selectedPrice = priceRanges.find(range => range[0] === priceRange) || priceRanges[0];
    return [...products].filter(product => {
      const price = Number(product.salePrice || product.regularPrice || 0);
      const inStock = Number(product.stock || 0) > 0;
      return (category === 'all' || product.category?.name === category) && (brand === 'all' || product.brandRelation?.name === brand) && (rating === 0 || Number(product.rating || 0) >= rating) && (availability === 'all' || (availability === 'in' ? inStock : !inStock)) && price >= selectedPrice[2] && price < selectedPrice[3];
    }).sort((first, second) => sort === 'price-low' ? Number(first.salePrice || first.regularPrice) - Number(second.salePrice || second.regularPrice) : sort === 'price-high' ? Number(second.salePrice || second.regularPrice) - Number(first.salePrice || first.regularPrice) : Number(second.stock || 0) - Number(first.stock || 0));
  }, [products, category, brand, rating, priceRange, availability, sort]);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const visibleProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetFilters = () => { setCategory('all'); setBrand('all'); setRating(0); setPriceRange('all'); setAvailability('all'); setPage(1); };
  const timerParts = [[Math.floor(remaining / 86400000), 'দিন'], [Math.floor(remaining % 86400000 / 3600000), 'ঘণ্টা'], [Math.floor(remaining % 3600000 / 60000), 'মিনিট'], [Math.floor(remaining % 60000 / 1000), 'সেকেন্ড']];

  return <main className="flash-sale-page"><div className="container">
    <section className="flash-hero"><div className="flash-hero-copy"><span className="flash-kicker"><Zap size={15} /> FLASH SALE</span><h1>দারুণ সব পণ্যে<br /><strong>বিশেষ ছাড়!</strong></h1><p>সীমিত সময়ের জন্য বেছে নেওয়া পণ্যে দুর্দান্ত অফার</p><Link href="#flash-products" className="flash-hero-cta">তাড়াতাড়ি করুন <ChevronRight size={17} /></Link></div><div className="flash-hero-orbit"><span>৬০%<small>পর্যন্ত</small></span><div className="flash-hero-products">{products.slice(0, 3).map(product => <img key={product.id} src={product.images?.[0]?.url || '/placeholder-product.png'} alt="" />)}</div></div></section>
    <section className="flash-offer-strip"><div className="flash-countdown"><h2>অফার শেষ হতে বাকি</h2><div className="flash-timer">{timerParts.map(([value, label]) => <div key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>)}</div>{remaining === 0 && <p className="flash-expired">এই অফারটি শেষ হয়ে গেছে</p>}</div><div className="flash-benefits"><div><Clock3 /><span><b>সীমিত সময়ের অফার</b><small>সময় শেষ হওয়ার আগেই নিন</small></span></div><div><Percent /><span><b>নির্বাচিত পণ্যে ছাড়</b><small>সেরা দামে কেনাকাটা</small></span></div><div><Zap /><span><b>দ্রুত অর্ডার করুন</b><small>স্টক সীমিত!</small></span></div></div></section>
    <section id="flash-products" className="flash-content"><aside className={`flash-sidebar ${mobileFilters ? 'is-open' : ''}`}><div className="flash-filter-heading"><h2>Filters</h2><button onClick={() => setMobileFilters(false)} aria-label="Close filters">×</button></div><div className="flash-filter-title"><h2>Filters</h2><button onClick={resetFilters}>Clear all</button></div><h3>Categories</h3><div className="flash-radio-list"><RadioOption checked={category === 'all'} label="All categories" count={products.length} onChange={() => { setCategory('all'); setPage(1); }} />{categories.map(item => <RadioOption key={item} checked={category === item} label={item} count={products.filter(product => product.category?.name === item).length} onChange={() => { setCategory(item); setPage(1); }} />)}</div><h3>Brand</h3><div className="flash-radio-list"><RadioOption checked={brand === 'all'} label="All brands" onChange={() => { setBrand('all'); setPage(1); }} />{brands.map(item => <RadioOption key={item} checked={brand === item} label={item} onChange={() => { setBrand(item); setPage(1); }} />)}</div><h3>Price Range</h3><div className="flash-radio-list">{priceRanges.map(([value, label]) => <RadioOption key={value} checked={priceRange === value} label={label} onChange={() => { setPriceRange(value); setPage(1); }} />)}</div><h3>Rating</h3><div className="flash-radio-list"><RadioOption checked={rating === 0} label="All ratings" onChange={() => { setRating(0); setPage(1); }} />{ratings.map(value => <RadioOption key={value} checked={rating === value} label={`${'★'.repeat(value)} & up`} count={products.filter(product => Number(product.rating || 0) >= value).length} onChange={() => { setRating(value); setPage(1); }} />)}</div><h3>Availability</h3><div className="flash-radio-list"><RadioOption checked={availability === 'all'} label="All products" onChange={() => { setAvailability('all'); setPage(1); }} /><RadioOption checked={availability === 'in'} label="In stock" count={products.filter(product => Number(product.stock || 0) > 0).length} onChange={() => { setAvailability('in'); setPage(1); }} /><RadioOption checked={availability === 'out'} label="Out of stock" count={products.filter(product => Number(product.stock || 0) < 1).length} onChange={() => { setAvailability('out'); setPage(1); }} /></div></aside>
      <div className="flash-product-area"><div className="flash-products-heading"><div><button className="flash-mobile-filter" onClick={() => setMobileFilters(true)}><Filter size={16} /> Filters</button><span className="flash-eyebrow">Special offers</span><h2>Flash Sale Products</h2><p>{filteredProducts.length} products found</p></div><label>Sort by<select value={sort} onChange={event => { setSort(event.target.value); setPage(1); }}><option value="popular">Most popular</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={15} /></label></div>{visibleProducts.length ? <div className="flash-product-grid">{visibleProducts.map(product => <ProductCard key={product.id} product={product} flashSale />)}</div> : <div className="flash-empty">No sale products match these filters.</div>}<div className="flash-pagination"><button disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /> Prev</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button className={page === number ? 'active' : ''} key={number} onClick={() => setPage(number)}>{number}</button>)}<button disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next <ChevronRight size={16} /></button></div></div></section>
    <section className="flash-services">{[[Truck, 'Free delivery', 'On ৳3000+ orders'], [Truck, 'Fast delivery', 'Nationwide'], [ShieldCheck, 'Secure payment', '100% protected'], [Heart, 'Easy returns', 'Within 7 days'], [Gift, 'Customer support', 'Always available']].map(([Icon, title, text]) => <div key={title}><Icon size={25} /><span><b>{title}</b><small>{text}</small></span></div>)}</section>
  </div></main>;
}
