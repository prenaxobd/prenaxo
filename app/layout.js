import './globals.css';

import StorefrontShell from '@/components/layout/StorefrontShell';
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  getSiteSettings,
} from '@/lib/seo';

export async function generateMetadata() {
  const settings = await getSiteSettings();

  const siteName = settings?.siteName || SITE_NAME;

  const title =
    settings?.metaTitle ||
    `${siteName} | Quality Products at Great Prices`;

  const description =
    settings?.metaDescription ||
    'Shop quality products online in Bangladesh at Ponno Mela. Discover everyday essentials, trending products, great deals and reliable delivery.';

  const canonical =
    settings?.canonicalUrl || SITE_URL;

  const ogTitle =
    settings?.ogTitle ||
    title;

  const ogDescription =
    settings?.ogDescription ||
    description;

  const ogImage = settings?.ogImage
    ? absoluteUrl(settings.ogImage)
    : absoluteUrl('/uploads/site_icon.png');

  const googleVerification =
    settings?.googleSearchConsoleVerification || undefined;

  const keywords = Array.isArray(settings?.keywords)
    ? settings.keywords
    : [
        'Ponno Mela',
        'online shopping Bangladesh',
        'Bangladesh online shop',
        'ecommerce Bangladesh',
        'quality products Bangladesh',
      ];

  return {
    metadataBase: new URL(SITE_URL),

    title: {
      default: title,
      template: `%s | ${siteName}`,
    },

    description,

    keywords,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    verification: googleVerification
      ? {
          google: googleVerification,
        }
      : undefined,

    icons: {
      icon: '/uploads/site_icon.png',
      shortcut: '/uploads/site_icon.png',
      apple: '/uploads/site_icon.png',
    },

    openGraph: {
      type: 'website',
      locale: 'en_BD',
      url: canonical,
      siteName,
      title: ogTitle,
      description: ogDescription,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: siteName,
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StorefrontShell>
          {children}
        </StorefrontShell>
      </body>
    </html>
  );
}