# quwahmarket-saas

Production-grade multi-vendor SaaS marketplace built with Next.js App Router, TypeScript, MongoDB (Mongoose), NextAuth, Stripe, and Pusher.

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Core Features](#core-features)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Database and Migrations](#database-and-migrations)
- [Authentication and Authorization](#authentication-and-authorization)
- [Payments (Stripe)](#payments-stripe)
- [Real-time Messaging](#real-time-messaging)
- [File Uploads](#file-uploads)
- [Security Model](#security-model)
- [Scripts](#scripts)
- [Deployment (Vercel)](#deployment-vercel)
- [Testing and Validation](#testing-and-validation)
- [Troubleshooting](#troubleshooting)
- [Seed Data and Demo Accounts](#seed-data-and-demo-accounts)
- [Roadmap Notes](#roadmap-notes)
- [License](#license)

## Overview
quwahmarket-saas is a marketplace where:
- Vendors publish digital products
- Buyers purchase and download products
- Platform collects a commission from each successful order
- Admins moderate users/products and monitor platform metrics

The codebase is structured for long-term maintainability with clear boundaries between:
- UI rendering
- action/route orchestration
- business logic services
- data access repositories

## Tech Stack
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- MongoDB + Mongoose
- NextAuth (JWT strategy)
- Stripe Checkout + Webhooks
- Zod validation
- TanStack Query
- UploadThing
- Pusher (real-time)
- Redis (optional, for rate limiting/caching)

## Architecture
The runtime flow is intentionally layered:

1. `app/*` pages and `app/api/*` routes
2. `server/actions/*` and route handlers (request/session orchestration)
3. `services/*` (business logic)
4. `server/repositories/*` (MongoDB queries via Mongoose)
5. Database

### Layer responsibilities
- `app/*`: render views, call server actions, no direct DB calls
- `app/api/*`: parse/validate request, auth checks, call services
- `server/actions/*`: server action boundary for forms/mutations
- `services/*`: domain logic and coordination
- `server/repositories/*`: centralized data access primitives
- `lib/*`: shared infra clients (`db`, `stripe`, `auth`, `redis`, `pusher`, `email`)

## Core Features
### Public marketplace
- Search + category filtering + price sorting
- Trending ranking by order volume with view/date fallback
- Server-side pagination
- Product detail pages with dynamic metadata

### Vendor
- Product CRUD
- Product status moderation support
- Analytics and revenue visualization
- Balance and transaction history
- Buyer/vendor messaging

### Buyer
- Order history
- Downloads for purchased products
- Product review submission/update
- Vendor messaging

### Admin
- User role management
- Product moderation
- Orders/disputes views
- Revenue/platform analytics

## Project Structure
```txt
app/
  (public)/
  (auth)/
  (dashboard)/
  (admin)/
  api/
  checkout/

components/
  admin/
  layout/
  marketplace/
  messaging/
  ui/
  vendor/

lib/
  auth.ts
  mongodb.ts
  mongoose.ts
  email.ts
  pusher.ts
  redis.ts
  security.ts
  stripe.ts
  utils.ts
  validations.ts

services/
  admin-query.service.ts
  admin-user.service.ts
  admin.service.ts
  auth.service.ts
  buyer-query.service.ts
  checkout-query.service.ts
  dispute.service.ts
  marketplace.service.ts
  messaging.service.ts
  payment.service.ts
  product.service.ts
  public-query.service.ts
  review.service.ts
  vendor-query.service.ts

server/
  actions/
  guards/
  models/
  repositories/

scripts/
  seed.ts

types/
middleware.ts
```

## Environment Variables
Use `.env.local` for local dev. Start from `.env.example`.

### App
- `NEXT_PUBLIC_APP_URL`
- `NODE_ENV`

### Database
- `MONGODB_URI`

### NextAuth
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Stripe
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Email
- `EMAIL_FROM`
- `SMTP_URL` or `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`

### Pusher
- `PUSHER_APP_ID`
- `PUSHER_KEY`
- `PUSHER_SECRET`
- `PUSHER_CLUSTER`
- `NEXT_PUBLIC_PUSHER_KEY`
- `NEXT_PUBLIC_PUSHER_CLUSTER`

### UploadThing
- `UPLOADTHING_SECRET`
- `UPLOADTHING_APP_ID`

### Optional Redis
- `REDIS_URL`

Notes:
- If `REDIS_URL` is missing or invalid, the app degrades safely and skips Redis-backed rate limiting/caching.
- Do not commit real secrets.

## Local Development
1. Install dependencies
```bash
npm install
```

2. Configure env file
```bash
cp .env.example .env.local
```

3. Seed data (optional)
```bash
npm run db:seed
```

4. Run dev server
```bash
npm run dev
```

5. Open
- `http://localhost:3000`

## Database and Migrations
The app uses MongoDB with Mongoose models (see `server/models/*`).

There are no migration files. Schema changes are managed via model updates and optional custom migration scripts as needed.

## Authentication and Authorization
### Authentication
- NextAuth with JWT strategy
- Credentials login with bcrypt password hashing
- Google OAuth provider
- Email verification and password reset flows

### Authorization
- Roles: `BUYER`, `VENDOR`, `ADMIN`
- Edge middleware route protection
- Server guards (`requireAuth`, `requireVendor`, `requireAdmin`, `requireBuyer`)
- API-level checks for role-sensitive endpoints

## Payments (Stripe)
### Checkout flow
- Client triggers `/api/stripe/checkout`
- Route validates session and input
- Service creates pending order + Stripe Checkout session
- Order stores `stripeSessionId`

### Webhook flow
- `/api/stripe/webhook` verifies signature
- Handles `checkout.session.completed` and `checkout.session.expired`
- Updates order status idempotently
- Credits vendor balance based on commission logic

### Commission logic
- Configured in `lib/stripe.ts`
- Default split: `15% platform`, `85% vendor`

## Real-time Messaging
- Thread model: buyer/vendor thread + message rows
- Pusher private channels: `private-thread-{threadId}`
- Authorization route validates thread participant access
- Messages persisted first, then event broadcast (best effort)

## File Uploads
- UploadThing routes under `app/api/uploadthing`
- Vendor-only uploads for product files/thumbnails
- Authenticated user uploads for avatars

## Security Model
- CSRF same-origin enforcement on sensitive API routes
- Rate limiting helper with Redis backing and safe fallback
- Request validation via Zod
- RBAC in middleware + route/action guards
- Secure headers from middleware/Next config
- Signature verification for Stripe webhooks

## Scripts
```bash
npm run dev
npm run build
npm run start
npm run lint

npm run db:seed
```

## Deployment (Vercel)
1. Push repository
2. Import into Vercel
3. Set all environment variables
4. Ensure `MONGODB_URI` is correct for your MongoDB cluster
5. Configure Stripe webhook endpoint:
- `https://<your-domain>/api/stripe/webhook`

## Testing and Validation
Current baseline checks:
- Type check: `npx tsc --noEmit`
- Lint: `npm run lint`
- Production build: `npm run build`

Recommended next steps:
- Add unit tests for services
- Add integration tests for auth/payment/messaging routes
- Add E2E smoke tests for checkout and dashboards

## Troubleshooting
### `REDIS_URL is invalid; caching and rate limiting will be skipped`
- Set `REDIS_URL` to a valid URI, or ignore for local dev.

### Stripe webhook signature mismatch
- Ensure `STRIPE_WEBHOOK_SECRET` matches your current Stripe CLI/dashboard endpoint.

### OAuth callback issues
- Verify `NEXTAUTH_URL` and Google OAuth redirect URIs are aligned.

### MongoDB connection issues
- Confirm `MONGODB_URI` is set and reachable from your environment.
- If using MongoDB Atlas, ensure IP allowlist and user credentials are correct.

## Seed Data and Demo Accounts
`npm run db:seed` creates demo users and sample marketplace data.

Default accounts (password: `Password123!`):
- `admin@quwahmarket-saas.com`
- `alex@quwahmarket-saas.com`
- `sarah@quwahmarket-saas.com`
- `marcus@quwahmarket-saas.com`
- `emily@quwahmarket-saas.com`
- `james@quwahmarket-saas.com`
- `priya@quwahmarket-saas.com`
- `tom@quwahmarket-saas.com`
- `lisa@quwahmarket-saas.com`

## Roadmap Notes
Potential next improvements:
- Automated test suite across service/repository layers
- Audit logs for admin actions
- Advanced payout workflow and withdrawal approvals
- S3-compatible storage abstraction option
- Observability (structured logs, traces, dashboards)

## License
MIT
