# Ponnomela

A full-stack Next.js App Router storefront for a modern Bangladeshi marketplace. The UI is ready for local development and the data layer uses Prisma with MySQL.

## Setup

1. Copy `.env.local.example` to `.env.local` and set `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.
2. Create the MySQL database: `CREATE DATABASE ponnomela;`
3. Generate the client and apply the schema: `npx prisma generate` then `npx prisma migrate dev --name init`.
4. Seed sample data: `npx prisma db seed`.
5. Start development: `npm run dev`.

Development admin credentials from the seed are `admin@example.com` / `ChangeMe123!`. Change them before any shared or production deployment.

## Routes

Storefront: `/`, `/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/wishlist`, `/account`.
Admin workspace: `/admin`, `/admin/products`, `/admin/categories`, `/admin/orders`, `/admin/customers`.

Payment providers are intentionally represented by the order payment method so bKash, Nagad, or SSLCommerz can be added behind the order API without changing the storefront contract.
