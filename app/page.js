import { getHomepageData } from '@/lib/homepage';

import HeroSlider from '@/components/home/HeroSlider';
import CategoryRail from '@/components/home/CategoryRail';
import BrandRail from '@/components/home/BrandRail';
import ProductRail from '@/components/home/ProductRail';
import ReviewRail from '@/components/home/ReviewRail';

import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  getSiteSettings,
  safeJsonLd,
} from '@/lib/seo';

export async function generateMetadata() {
  const settings = await getSiteSettings();

  const title =
    settings?.metaTitle ||
    `${SITE_NAME} | Quality Products at Great Prices`;

  const description =
    settings?.metaDescription ||
    'Shop quality products online in Bangladesh at Ponno Mela. Discover everyday essentials, trending products, great deals and reliable delivery.';

  const canonical =
    settings?.canonicalUrl || SITE_URL;

  const ogTitle =
    settings?.ogTitle || title;

  const ogDescription =
    settings?.ogDescription || description;

  const ogImage = settings?.ogImage
    ? absoluteUrl(settings.ogImage)
    : absoluteUrl('/uploads/site_icon.png');

  return {
    title: {
      absolute: title,
    },

    description,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      type: 'website',
      locale: 'en_BD',
      url: canonical,
      siteName: SITE_NAME,
      title: ogTitle,
      description: ogDescription,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: SITE_NAME,
            },
          ]
        : [],
    },

    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : [],
    },
  };
}

function productsFor(type, data, section) {
  const limit = section?.productLimit || 8;

  if (type === 'TOP_SELLING') {
    return data.topSelling.slice(0, limit);
  }

  if (type === 'DEALS') {
    return data.deals.slice(0, limit);
  }

  if (type === 'NEW_ARRIVALS') {
    return data.newArrivals.slice(0, limit);
  }

  if (type === 'CATEGORY') {
    return (
      data.categorySections
        .find(
          (item) => item.id === section.categoryId
        )
        ?.products.slice(0, limit) || []
    );
  }

  return data.featured.slice(0, limit);
}

function HomeStructuredData({ data }) {
  const settings = data?.settings;

  const logo = settings?.logo
    ? absoluteUrl(settings.logo)
    : absoluteUrl('/uploads/site_icon.png');

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: settings?.siteName || SITE_NAME,
    url: SITE_URL,
    ...(logo
      ? {
          logo: {
            '@type': 'ImageObject',
            url: logo,
          },
        }
      : {}),
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: settings?.siteName || SITE_NAME,
    url: SITE_URL,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(organization),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(website),
        }}
      />
    </>
  );
}

export default async function Home() {
  const [data, settings] = await Promise.all([
    getHomepageData(),
    getSiteSettings(),
  ]);

  const configuredSections = data.sections.length
    ? data.sections
    : [
        {
          id: 'deals',
          type: 'DEALS',
          title: "Today's deals",
          eyebrow: 'Limited-time value',
          href: '/flash-sale',
        },
        {
          id: 'top-selling',
          type: 'TOP_SELLING',
          title: 'Top selling products',
          eyebrow: 'Loved by local homes',
        },
        {
          id: 'featured',
          type: 'FEATURED',
          title: 'Featured products',
          eyebrow: 'Chosen for you',
        },
        ...data.categorySections.map((category) => ({
          id: category.id,
          type: 'CATEGORY',
          categoryId: category.id,
          title: category.name,
          eyebrow: 'Explore the collection',
          href: `/category/${category.slug}`,
        })),
        {
          id: 'new-arrivals',
          type: 'NEW_ARRIVALS',
          title: 'New arrivals',
          eyebrow: 'Freshly added',
        },
      ];

  return (
    <>
      <HomeStructuredData
        data={{
          ...data,
          settings,
        }}
      />

      <main className="home-page">

        {/* =====================================================
            HERO AREA
            Left  = Dynamic Hero Slider
            Right = Static Promotional Banner
            ===================================================== */}

        <HeroSlider
          banners={data.banners}
          rightBanner={data.homeRightBanner}
        />
        
        {/* =====================================================
            CATEGORY RAIL
            ===================================================== */}

        <CategoryRail
          categories={data.categories}
        />

        {/* =====================================================
            PRODUCT SECTIONS
            ===================================================== */}

        {configuredSections.map((section) => (
          <ProductRail
            key={section.id}
            title={section.title}
            eyebrow={section.eyebrow}
            products={productsFor(
              section.type,
              data,
              section
            )}
            href={
              section.href ||
              (
                section.type === 'CATEGORY'
                  ? `/category/${section.category?.slug || ''}`
                  : '/shop'
              )
            }
          />
        ))}

        {/* =====================================================
            BRAND RAIL
            ===================================================== */}

        <BrandRail
          brands={data.brands}
        />

        {/* =====================================================
            REVIEW RAIL
            ===================================================== */}

        <ReviewRail
          reviews={data.reviews}
        />

      </main>
    </>
  );
}