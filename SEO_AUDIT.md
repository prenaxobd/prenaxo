# Prenaxo Technical SEO Audit

Audit date: 2026-10-28

## Initial findings and priority

No critical SEO blocker was identified in the reviewed implementation.

| Priority | Finding | Status |
|---|---|---|
| High | Product pages did not use the saved SEO title or description, despite `ProductSEO` fields being present. | Fixed |
| High | Shop query variants such as sort, price, rating, availability, and pagination were not all marked `noindex`. | Fixed |
| High | The sitemap returned a homepage-only fallback when database access failed, which could look like a successful but incomplete sitemap. | Fixed; errors now surface |
| High | Sitemap `lastModified` values were generated from the current time for static pages and categories without a reliable update date. | Fixed; only product `updatedAt` is emitted |
| High | Nested category URLs were permanently redirected with Next.js's 308 behavior, not the requested 301. | Fixed with a targeted Next.js Proxy redirect |
| Medium | The homepage had no primary H1; it now has a visible, store-specific heading and short introduction. | Fixed |
| Medium | Product JSON-LD used an invented SKU fallback and derived availability from product-level stock even when variant stock was used. | Fixed; actual SKU only, variant-aware availability, and Offer omitted without a valid price |
| Medium | Public informational pages inherited homepage metadata, while utility pages could inherit the homepage canonical and social tags. | Fixed with page-specific metadata |
| Medium | `robots.txt` blocked several utility pages that were marked `noindex`, preventing crawlers from seeing those directives. | Fixed; utility routes are crawlable and carry `noindex` |
| Low | Static fallback titles included unsupported promotional phrasing and could use inconsistent brand casing. | Updated to descriptive Bangladesh-focused defaults and the canonical Prenaxo brand spelling |

Product and category SEO models already existed, so no schema change or database migration was necessary. Category metadata already used its SEO settings; the implementation preserves that behavior and constrains canonical URLs to the preferred site host.

## Changes made

- Product pages now use saved SEO title, description, canonical, Open Graph, and Twitter settings with product-specific fallbacks.
- Product structured data uses the real SKU, BDT, the rendered price when positive, and availability derived from inventory variants. Approved reviews remain the only source of review/rating data.
- Inactive products are excluded from structured data and receive `noindex`; the product route's existing rendering behavior is otherwise unchanged.
- Canonicals for configured SEO URLs are constrained to the preferred production host and omit query strings/fragments. Off-site canonicals fall back to the route URL.
- Shop query variants and category query variants use `noindex,follow` and canonicalize to their base listing route.
- Public content pages now have their own canonical, title, description, Open Graph, and Twitter metadata. Account, login, registration, search, cart, checkout, wishlist, order confirmation, order tracking, and admin pages are marked `noindex`.
- `robots.txt` allows public routes and disallows only `/admin` and `/api/`; it references the production sitemap.
- The sitemap includes the homepage, shop, public informational pages, active indexable products with self-canonicals, active parent categories with self-canonicals, and combo/sale pages only when their catalog content exists. It revalidates hourly and does not invent timestamps.
- The homepage now has one clear, visible H1. Product images already use saved alt text or fall back to the actual product name; no image files or URLs were changed.
- No products, categories, customer/order data, payment behavior, pricing, database schema, or migration files were changed.

## Confirmed URL change

Git history confirms the nested subcategory route was changed to a parent-category filter route. The redirect preserves other query parameters:

| Old route | Destination |
|---|---|
| `/category/{parentSlug}/{subcategorySlug}` | `/category/{parentSlug}?subcategory={subcategorySlug}` |

The redirect is a direct HTTP 301. No other historical product or category slug mapping was confirmed in the inspected route history, so no speculative redirects were added.

## Files changed

- `lib/seo.js`, `lib/seo.test.js`: shared metadata/canonical handling and canonical tests.
- `app/layout.js`, `app/page.js`, `app/globals.css`: canonical brand defaults, homepage metadata and H1.
- `app/product/[slug]/page.js`: product metadata, canonicalized JSON-LD, actual identifiers and inventory availability.
- `app/shop/page.js`: filtered-query indexing policy.
- `app/sitemap.js`, `app/robots.js`: sitemap eligibility, timestamp, refresh, crawler policy, and sitemap URL.
- `proxy.js`: confirmed nested-category 301 mapping.
- `app/about/layout.js`, `app/contact/layout.js`, `app/faq/page.js`, `app/privacy/page.js`, `app/terms/page.js`, `app/combos/page.js`, `app/flash-sale/page.js`: public page metadata.
- `app/login/page.js`, `app/register/page.js`, `app/cart/page.js`, `app/checkout/page.js`, `app/order-success/page.js`, `app/search/page.js`, `app/account/layout.js`, `app/wishlist/layout.js`, `app/track-order/layout.js`, `app/admin/layout.js`: utility metadata and indexing policy.

## Verified results

- `npm.cmd run lint`: passed with 0 errors. One existing warning remains for the `<img>` used by the noscript Facebook pixel in `app/layout.js`.
- `npx.cmd vitest run`: passed, 8 test files and 26 tests.
- `npx.cmd next build`: passed. This was run directly; `npm run build` was intentionally not used because that script invokes `prisma migrate deploy`.
- `git diff --check`: passed.
- Local production-build checks returned HTTP 200 for the homepage, informational pages, a product page, a category page, and utility pages.
- Rendered HTML checks confirmed self-canonicals on representative routes, `noindex,follow` for filtered shop/category URLs and utility pages, and `index,follow` for the tested product/category pages.
- `/robots.txt` returned HTTP 200 and points to `https://www.prenaxo.com/sitemap.xml`.
- `/sitemap.xml` returned HTTP 200 and parsed as XML: 82 URLs, no duplicate locations, and no non-production hosts. Sitemap product `lastmod` values come from the product `updatedAt` field; static pages and categories have no fabricated `lastmod`.
- The nested category URL pattern returned a direct 301 with its filter query preserved.
- Local verification is not a claim that Google has indexed any page or that the deployed production version has been updated.

## Confirmed sitemap and robots URLs

- Sitemap: <https://www.prenaxo.com/sitemap.xml>
- Robots: <https://www.prenaxo.com/robots.txt>

## Google Search Console checklist

1. Deploy these changes, then open both URLs above and confirm they return HTTP 200 on production.
2. Keep the existing Search Console property and ownership verification. Confirm the preferred `https://www.prenaxo.com` domain/redirect is configured in the hosting and domain settings; no domain redirect configuration was changed here.
3. In the existing property, open **Sitemaps**, submit `sitemap.xml`, and review the reported fetch and parsing status.
4. Use **URL Inspection** on:
   - `https://www.prenaxo.com/`
   - `https://www.prenaxo.com/shop`
   - `https://www.prenaxo.com/category/natural-foods`
   - `https://www.prenaxo.com/product/prenaxo-premium-cotton-printed-basic-black-t-shirt-for-men`
   - `https://www.prenaxo.com/about`
   - `https://www.prenaxo.com/contact`
5. For each URL, verify the live response, crawl permission, selected canonical, and rendered page content. Request indexing for selected updated public URLs only after the deployment is live.
6. Monitor Page indexing and sitemap reports for excluded, duplicate-canonical, redirect, and fetch errors. Sitemap submission or an indexing request does not guarantee indexing or rankings.

## Remaining manual checks

- Verify production domain redirects (HTTP to HTTPS and non-`www` to `www`) in the actual hosting/domain configuration.
- Inspect Search Console's existing verification and sitemap status after deployment; those external services are not available to this local audit.
- Confirm saved SEO fields and canonical overrides for the full production catalog in the admin panel; this audit validates route behavior but does not individually inspect every production record.
- Review the About page's existing business statistics and service claims with the business owner to ensure they remain accurate. They were not changed as part of this technical SEO work.
- Run a production crawler and Core Web Vitals/CrUX review after deployment. No complete external link crawl, field-performance measurement, or Google Rich Results Test was run.
