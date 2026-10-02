# Prenaxo

A full-stack Next.js App Router storefront for a modern Bangladeshi marketplace. The UI is ready for local development and the data layer uses Prisma with MySQL.

## Setup

1. Copy `.env.local.example` to `.env.local` and set `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.
2. Create the MySQL database: `CREATE DATABASE prenaxo_db;`
3. Generate the client and apply the schema: `npx prisma generate` then `npx prisma migrate dev --name init`.
4. Seed sample data: `npx prisma db seed`.
5. Start development: `npm run dev`.

## Payments

Payment methods are typed as cash on delivery, bank transfer, manual mobile wallet, or hosted gateway. bKash, Nagad, and Rocket manual transfers stay pending review until staff records a decision and note. Gateway payments remain pending until an SSLCommerz server-side validation succeeds; browser redirects alone never mark orders paid.

Before applying the payment schema migration, take a database backup. Then apply the additive migration with `npx prisma migrate deploy` (or `npx prisma migrate dev` in a disposable development database). Existing payment methods and orders are retained; Rocket and SSLCommerz defaults are inserted disabled.

For SSLCommerz sandbox, set `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, and `SSLCOMMERZ_MODE="sandbox"` in the server environment. Use `SSLCOMMERZ_MODE="live"` only with production merchant credentials and a public HTTPS `NEXTAUTH_URL`. Configure the merchant portal IPN URL as `/api/payments/sslcommerz/ipn`. Schedule a POST to `/api/payments/sslcommerz/reconcile` every 10 minutes with `Authorization: Bearer <PAYMENT_RECONCILE_SECRET>` so abandoned sessions are checked and inventory is released only after provider confirmation. Never expose credentials through `NEXT_PUBLIC_*` variables or store them in payment-method records. The gateway method cannot be enabled until the server configuration is complete.

Development admin credentials from the seed are `admin@example.com` / `ChangeMe123!`. Change them before any shared or production deployment.

## Routes

Storefront: `/`, `/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/wishlist`, `/account`.
Admin workspace: `/admin`, `/admin/products`, `/admin/categories`, `/admin/orders`, `/admin/customers`.

SSLCommerz is integrated as a hosted gateway. Its supported mobile-wallet availability is controlled by the merchant account; manual bKash, Nagad, and Rocket transfers remain separate methods.
# prenaxo
