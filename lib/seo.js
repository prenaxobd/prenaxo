import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

export const SITE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://www.prenaxo.com'
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const SITE_NAME = 'Prenaxo';
export const DEFAULT_CONTACT_EMAIL = 'prenaxo@gmail.com';

export function normalizeSiteSettings(settings) {
  const hasLegacyBrandName = (value) => {
    if (!value || typeof value !== 'string') return true;
    const normalized = value.trim().toLowerCase();
    return !normalized || normalized.includes('khatibaz');
  };

  const rawSiteName = settings?.siteName;
  const rawContactEmail = settings?.contactEmail;

  return {
    ...settings,
    siteName: hasLegacyBrandName(rawSiteName) ? SITE_NAME : rawSiteName.trim(),
    contactEmail: hasLegacyBrandName(rawContactEmail)
      ? DEFAULT_CONTACT_EMAIL
      : rawContactEmail.trim(),
  };
}

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

const getCachedSiteSettings = unstable_cache(async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return settings ? normalizeSiteSettings(settings) : null;
  } catch (error) {
    console.error('getSiteSettings error:', error);
    return null;
  }
}, ['site-settings'], { tags: ['site-settings', 'seo'], revalidate: 300 });

export const getSiteSettings = cache(() => getCachedSiteSettings());

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
  if (!seoCanonical) return absoluteUrl(fallbackPath);

  try {
    const canonical = new URL(seoCanonical, SITE_URL);

    if (
      canonical.hostname === 'localhost' ||
      canonical.hostname === '127.0.0.1'
    ) {
      return absoluteUrl(fallbackPath);
    }

    return canonical.toString();
  } catch {
    return absoluteUrl(fallbackPath);
  }
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