import { getHomepageData } from '@/lib/homepage';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryRail from '@/components/home/CategoryRail';
import BrandRail from '@/components/home/BrandRail';
import ProductRail from '@/components/home/ProductRail';
import ReviewRail from '@/components/home/ReviewRail';

function productsFor(type, data, section) {
  const limit = section?.productLimit || 8;
  if (type === 'TOP_SELLING') return data.topSelling.slice(0, limit);
  if (type === 'DEALS') return data.deals.slice(0, limit);
  if (type === 'NEW_ARRIVALS') return data.newArrivals.slice(0, limit);
  if (type === 'CATEGORY') return data.categorySections.find(item => item.id === section.categoryId)?.products.slice(0, limit) || [];
  return data.featured.slice(0, limit);
}

export default async function Home() {
  const data = await getHomepageData();
  const configuredSections = data.sections.length ? data.sections : [
    { id: 'deals', type: 'DEALS', title: "Today's deals", eyebrow: 'Limited-time value', href: '/flash-sale' },
    { id: 'top-selling', type: 'TOP_SELLING', title: 'Top selling products', eyebrow: 'Loved by local homes' },
    { id: 'featured', type: 'FEATURED', title: 'Featured products', eyebrow: 'Chosen for you' },
    ...data.categorySections.map(category => ({ id: category.id, type: 'CATEGORY', categoryId: category.id, title: category.name, eyebrow: 'Explore the collection', href: `/category/${category.slug}` })),
    { id: 'new-arrivals', type: 'NEW_ARRIVALS', title: 'New arrivals', eyebrow: 'Freshly added' },
  ];
  return <main className="home-page"><HeroSlider banners={data.banners} /><CategoryRail categories={data.categories} />{configuredSections.map(section => <ProductRail key={section.id} title={section.title} eyebrow={section.eyebrow} products={productsFor(section.type, data, section)} href={section.href || (section.type === 'CATEGORY' ? `/category/${section.category?.slug || ''}` : '/shop')} />)}<BrandRail brands={data.brands} /><ReviewRail reviews={data.reviews} /></main>;
}
