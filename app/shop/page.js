import { getProducts } from '@/lib/products';
import { prisma } from '@/lib/prisma';
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

export default async function Shop() {
  const [
    products,
    brands,
    categories,
  ] = await Promise.all([
    getProducts(),

    prisma.brand.findMany({
      where: {
        active: true,
      },

      orderBy: {
        name: 'asc',
      },
    }),

    prisma.category.findMany({
      where: {
        active: true,
      },

      orderBy: {
        name: 'asc',
      },
    }),
  ]);


  return (
    <ShopBrowser
      products={products}
      brands={brands}
      categories={categories}
    />
  );
}