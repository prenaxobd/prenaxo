import './globals.css';
import '@/components/flash-sale/FlashSalePage.css';

import StorefrontShell from '@/components/layout/StorefrontShell';
import Footer from '@/components/layout/Footer';
import AuthSessionProvider from '@/components/auth/SessionProvider';
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  getCanonical,
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
    'Shop quality products online in Bangladesh at Prenaxo. Discover everyday essentials, trending products, great deals and reliable delivery.';

  const canonical = getCanonical(settings?.canonicalUrl, '/');

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
        'Prenaxo',
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

    keywords,

    description,

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthSessionProvider>
          <StorefrontShell footer={<Footer />}>
            {children}
          </StorefrontShell>
        </AuthSessionProvider>
      </body>
    </html>
  );
}