import './globals.css';
import Script from 'next/script';

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
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthSessionProvider>
          <StorefrontShell footer={<Footer />}>
            {children}
          </StorefrontShell>
        </AuthSessionProvider>
        <Script id="facebook-pixel-queue" strategy="afterInteractive">
          {`!function(f){if(f.fbq)return;var n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window);
fbq('init','1485362603491782');
fbq('track','PageView');
var loadPrenaxoPixel=function(){if(window.__prenaxoPixelLoaded)return;window.__prenaxoPixelLoaded=true;var s=document.createElement('script');s.async=true;s.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(s)};
var schedulePrenaxoPixel=function(){if('requestIdleCallback' in window){window.requestIdleCallback(loadPrenaxoPixel,{timeout:10000})}else{window.setTimeout(loadPrenaxoPixel,5000)}};
if(document.readyState==='complete'){schedulePrenaxoPixel()}else{window.addEventListener('load',schedulePrenaxoPixel,{once:true})}`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1485362603491782&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}