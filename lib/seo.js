import { prisma } from '@/lib/prisma';

export const SITE_URL = 'https://ponno-mela.com';
export const SITE_NAME = 'Ponno Mela';

export function absoluteUrl(value) {
  if (!value) return null;

  try {
    return new URL(value, SITE_URL).toString();
  } catch {
    return null;
  }
}

export function cleanText(value, fallback = '') {
  if (!value) return fallback;

  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(value, length = 160) {
  const text = cleanText(value);

  if (text.length <= length) return text;

  return `${text.slice(0, length - 1).trim()}…`;
}

export async function getSiteSettings() {
  try {
    return await prisma.siteSettings.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    });
  } catch (error) {
    console.error('getSiteSettings error:', error);
    return null;
  }
}

export function getRobots(seo) {
  return {
    index: seo?.robotsIndex !== 'NOINDEX',
    follow: seo?.robotsFollow !== 'NOFOLLOW',
    googleBot: {
      index: seo?.robotsIndex !== 'NOINDEX',
      follow: seo?.robotsFollow !== 'NOFOLLOW',
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };
}

export function getCanonical(seoCanonical, fallbackPath) {
  return absoluteUrl(seoCanonical || fallbackPath);
}

export function getImage(image) {
  return absoluteUrl(image);
}

export function getProductPrice(product) {
  const regular = Number(product?.regularPrice || 0);
  const sale =
    product?.salePrice !== null && product?.salePrice !== undefined
      ? Number(product.salePrice)
      : null;

  return sale !== null && sale > 0 && sale < regular ? sale : regular;
}

export function getProductAvailability(product) {
  return Number(product?.stock || 0) > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
}

export function safeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}