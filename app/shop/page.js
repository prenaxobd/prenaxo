import { getShopProducts } from '@/lib/products';
import { getPublicBrands, getPublicCategories } from '@/lib/public-data';
import ShopBrowser from '@/components/shop/ShopBrowser';

import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  getSiteSettings,
} from '@/lib/seo';


/* =====================================================
   SHOP SEO
===================================================== */

export async function generateMetadata({
  searchParams,
}) {
  const params = await searchParams;

  const settings =
    await getSiteSettings();

  const hasFilter =
    params?.category ||
    params?.brand ||
    params?.search ||
    params?.q;


  const title =
    settings?.metaTitle
      ? `Shop | ${SITE_NAME}`
      : `Shop Quality Products | ${SITE_NAME}`;


  const description =
    'Browse quality products at Prenaxo. Shop everyday essentials, trending products, great deals and reliable delivery across Bangladesh.';


  return {
    title,

    description,

    alternates: {
      canonical:
        absoluteUrl('/shop'),
    },

    robots: hasFilter
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },

    openGraph: {
      type: 'website',
      locale: 'en_BD',
      url: absoluteUrl('/shop'),
      siteName: SITE_NAME,
      title,
      description,

      images: settings?.ogImage
        ? [
            {
              url: absoluteUrl(
                settings.ogImage
              ),
              width: 1200,
              height: 630,
              alt: SITE_NAME,
            },
          ]
        : [
            {
              url: absoluteUrl(
                '/uploads/site_icon.png'
              ),
              width: 512,
              height: 512,
              alt: SITE_NAME,
            },
          ],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,

      images: settings?.ogImage
        ? [absoluteUrl(settings.ogImage)]
        : [
            absoluteUrl(
              '/uploads/site_icon.png'
            ),
          ],
    },
  };
}


/* =====================================================
   SHOP PAGE
===================================================== */

export default async function Shop({ searchParams }) {
  const params = await searchParams;
  const priceRange = {
    min: params?.min || '',
    max: params?.max || '',
  };
  const filters = {
    category: params?.category || 'all',
    brand: params?.brand || 'all',
    search: params?.search || params?.q || '',
    priceRange,
    ratingFilter: Number(params?.rating || 0),
    availability: params?.availability || 'all',
    sort: params?.sort || 'newest',
    page: Math.max(1, Number(params?.page) || 1),
  };

  const [
    productData,
    brands,
    categories,
  ] = await Promise.all([
    getShopProducts({
      ...filters,
      min: priceRange.min,
      max: priceRange.max,
      rating: filters.ratingFilter,
      perPage: 16,
    }),

    getPublicBrands(),
    getPublicCategories(),
  ]);


  return (
    <ShopBrowser
      products={productData.products}
      total={productData.total}
      totalPages={productData.totalPages}
      currentPage={productData.page}
      initialFilters={filters}
      brands={brands}
      categories={categories}
    />
  );
}