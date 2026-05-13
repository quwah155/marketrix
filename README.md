# Marketrix SaaS Marketplace

Production-grade multi-vendor digital marketplace built with Next.js App Router, TypeScript, MongoDB/Mongoose, NextAuth, Stripe, Cloudinary, UploadThing, Pusher, and Redis-backed rate limiting.

Marketrix supports buyer, vendor, and admin workflows: vendors publish downloadable products, buyers purchase and review them, admins moderate the platform, and buyers/vendors can message each other in real time.

## Contents
- [Current Stack](#current-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Marketplace and Products](#marketplace-and-products)
- [Payments](#payments)
- [Messaging](#messaging)
- [Uploads and Media](#uploads-and-media)
- [Email](#email)
- [Database](#database)
- [Security](#security)
- [Scripts](#scripts)
- [Validation](#validation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Seed Data](#seed-data)
- [Known Gaps](#known-gaps)

## Current Stack
- Next.js 16 App Router with React 19
- TypeScript in strict mode
- Tailwind CSS
- MongoDB with Mongoose models and repository helpers
- NextAuth v4 with JWT sessions, Credentials, Google OAuth, and MongoDB adapter
- Stripe Checkout and signed webhooks
- UploadThing for authenticated downloadable files and avatars
- Cloudinary unsigned uploads for product thumbnails
- Pusher private channels for real-time messaging
- Redis via ioredis for optional rate limiting
- Nodemailer for account verification and password reset email
- Zod for request, form, and action validation
- TanStack Query for client data fetching where needed
- Recharts for dashboard charts

## Features
### Public Marketplace
- Landing, pricing, legal, and about pages.
- Product listing at `/products` with search, category filtering, sorting, and pagination.
- Product detail pages at `/products/[slug]` with dynamic metadata, vendor info, reviews, purchase CTA, and buyer-to-vendor messaging entry point.
- Product views are incremented asynchronously from the product detail page.

### Authentication
- Email/password registration with bcrypt password hashing.
- Google OAuth sign-in.
- Email verification before credential login when SMTP is configured.
- Password reset request and token-based reset flow.
- Account settings and password settings for authenticated users.

### Buyer Dashboard
- `/dashboard/buyer`
- Orders, downloads, reviews, settings, and messages.
- Purchased products expose download links after completed Stripe checkout.
- Buyers can review products and message vendors.

### Vendor Dashboard
- `/dashboard/vendor`
- Product CRUD, order management, analytics, balance, settings, and messages.
- Vendor profile settings include bio, website, avatar, verification state, and balance.
- Vendors can sync a pending order against Stripe session state.

### Admin Dashboard
- `/admin`
- User, product, order, dispute, analytics, and settings views.
- Admins can update user roles through `/api/admin/users/role`.
- Admin routes are protected by role checks in `proxy.ts` and server/API guards.

## Architecture
The app is organized around clear runtime layers:

1. `app/*` pages and `app/api/*` route handlers render UI and expose HTTP endpoints.
2. `server/actions/*` handle form submissions and server action orchestration.
3. `server/guards/*` centralize role and session requirements for server actions/pages.
4. `services/*` contain business workflows such as checkout, messaging, auth, reviews, settings, and dashboard queries.
5. `server/repositories/*` contain data access helpers around Mongoose models.
6. `server/models/*` define MongoDB collection schemas.
7. `lib/*` contains shared infrastructure clients and utilities.

The general rule is: pages/actions/routes orchestrate, services decide behavior, repositories talk to the database.

## Project Structure
```txt
app/
  (public)/              Public pages and marketplace routes
  (auth)/                Login, register, verify-email, reset-password
  (dashboard)/           Buyer and vendor dashboards
  (admin)/               Admin dashboard routes
  api/                   Route handlers for auth, Stripe, messages, Pusher, UploadThing
  checkout/              Stripe success/cancel pages

components/
  admin/                 Admin table/action/chart components
  layout/                Navbar, footer, brand, dashboard sidebar
  marketplace/           Product cards, filters, checkout button
  messaging/             Real-time messaging UI
  settings/              Account, password, vendor profile forms
  ui/                    Shared UI primitives
  vendor/                Vendor product/order/chart components

lib/
  auth.ts                NextAuth config
  cloudinary.ts          Client-side Cloudinary upload helper
  email.ts               Nodemailer templates and send helpers
  mongodb.ts             MongoDB client promise for NextAuth adapter
  mongoose.ts            Mongoose connection helper
  pusher.ts              Lazy Pusher server client and channel helpers
  redis.ts               Optional Redis client and rate limiter
  security.ts            CSRF/origin and rate-limit helpers
  security-headers.js    Shared security header helper
  stripe.ts              Lazy Stripe client and fee calculation
  utils.ts               Formatting, tokens, class utilities
  validations.ts         Zod schemas

server/
  actions/               Server actions for auth, products, settings, buyer/vendor/admin flows
  guards/                requireAuth/requireRole helpers
  models/                Mongoose schemas
  repositories/          Data access helpers

services/                Business logic and dashboard query services
scripts/seed.ts          Demo data seeding
types/                   Shared app and NextAuth types
proxy.ts                 Route protection and security headers
```

## Environment Variables
Use `.env.local` for local development. Start from `.env.example`.

### App
- `NEXT_PUBLIC_APP_URL`: Public app origin, for example `http://localhost:3000`.
- `NODE_ENV`: Usually managed by Next.js.

### MongoDB
- `MONGODB_URI`: MongoDB connection string.

### NextAuth
- `NEXTAUTH_SECRET`: Long random secret for session/JWT signing.
- `NEXTAUTH_URL`: Canonical app URL for NextAuth callbacks.
- `GOOGLE_CLIENT_ID`: Google OAuth client ID.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.

Google callback URL:
```txt
https://<your-domain>/api/auth/callback/google
```

### Stripe
- `STRIPE_SECRET_KEY`: Stripe secret key.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key.
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret for `/api/stripe/webhook`.

### Email
- `EMAIL_FROM`: Sender address.
- `SMTP_URL`: Optional single SMTP URL supported by `lib/email.ts`.
- `SMTP_HOST`: SMTP host if not using `SMTP_URL`.
- `SMTP_PORT`: SMTP port, usually `465` or `587`.
- `SMTP_SECURE`: `true` for port `465`; otherwise often `false`.
- `SMTP_USER`: SMTP username.
- `SMTP_PASS`: SMTP password or app password.

### Pusher
- `PUSHER_APP_ID`
- `PUSHER_KEY`
- `PUSHER_SECRET`
- `PUSHER_CLUSTER`
- `NEXT_PUBLIC_PUSHER_KEY`
- `NEXT_PUBLIC_PUSHER_CLUSTER`

If server Pusher values are missing, the server client safely no-ops for triggers, but `/api/pusher/auth` returns `503`.

### Cloudinary
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_PRODUCT_IMAGES_UPLOAD_PRESET`
- `NEXT_PUBLIC_CLOUDINARY_PRODUCT_IMAGES_FOLDER` optional, defaults to `marketrix/products`

Product thumbnail uploads use an unsigned Cloudinary upload preset from the browser. Restrict this preset to images, cap file size, and optionally lock folder behavior in Cloudinary.

### UploadThing
- `UPLOADTHING_TOKEN`

UploadThing currently handles downloadable product files and user avatars. Product thumbnails use Cloudinary instead.

### Redis
- `REDIS_URL` optional.

When `REDIS_URL` is missing, invalid, or fails at runtime, rate limiting degrades open and logs a warning instead of breaking the app.

## Local Development
1. Install dependencies:
```bash
npm install
```

2. Create local env:
```bash
cp .env.example .env.local
```

3. Fill required environment variables:
- MongoDB and NextAuth are required for authenticated app flows.
- Stripe is required for checkout.
- SMTP is required for registration verification and password reset.
- UploadThing is required for downloadable files and avatar uploads.
- Cloudinary is required for product thumbnails.
- Pusher is required for real-time message subscriptions.
- Redis is optional.

4. Seed demo data, optional:
```bash
npm run db:seed
```

5. Start development server:
```bash
npm run dev
```

6. Open:
```txt
http://localhost:3000
```

## Authentication
Auth is configured in `lib/auth.ts` and served from `app/api/auth/[...nextauth]/route.ts`.

- Credentials provider validates email/password against MongoDB users.
- Passwords are hashed with bcrypt.
- Google provider creates/signs in OAuth users.
- JWT sessions include `id`, `role`, `name`, and image.
- Credentials login blocks unverified users when SMTP is configured.
- New vendor registrations automatically create a vendor profile.
- Email verification tokens expire after 24 hours.
- Password reset tokens expire after 1 hour.

Auth-related pages:
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/verify-email`
- `/auth/error`

## Authorization
Roles are defined in `types/db.ts`:
- `BUYER`
- `VENDOR`
- `ADMIN`

Protection happens in several places:
- `proxy.ts` protects dashboard/admin/API route families.
- `server/guards/auth.guard.ts` exposes `requireAuth`, `requireBuyer`, `requireVendor`, and `requireAdmin`.
- Sensitive API routes check the session and role before doing work.
- Vendor routes allow vendors and admins where appropriate.
- Admin routes require `ADMIN`.

Public paths include the landing pages, product pages, auth pages, Stripe webhooks, UploadThing routes, and static assets.

## Marketplace and Products
Products are stored in the `products` collection with:
- vendor profile reference
- title, slug, description, price, category
- file URL, preview URL, thumbnail URL
- status: `DRAFT`, `PUBLISHED`, `SUSPENDED`
- view count
- timestamps

Product categories:
- `SOFTWARE`
- `EBOOKS`
- `COURSES`
- `TEMPLATES`
- `GRAPHICS`
- `AUDIO`
- `VIDEO`
- `OTHER`

Vendor product form:
- Uses Zod validation from `productSchema`.
- Uploads product thumbnails to Cloudinary.
- Uploads downloadable files through UploadThing.
- Supports draft and published status.

Public product discovery is handled by `services/public-query.service.ts` and product management by `services/product.service.ts`.

## Payments
Payments use Stripe Checkout.

Checkout flow:
1. Buyer clicks checkout for a published product.
2. `/api/stripe/checkout` validates same-origin, session, rate limit, and product ID.
3. `services/payment.service.ts` rejects self-purchases and duplicate completed purchases.
4. A pending order is created.
5. Stripe Checkout session is created.
6. The order is linked to `stripeSessionId`.
7. Buyer is redirected to Stripe.

Webhook flow:
1. Stripe posts to `/api/stripe/webhook`.
2. Route verifies `stripe-signature` with `STRIPE_WEBHOOK_SECRET`.
3. `checkout.session.completed` finalizes paid orders.
4. `checkout.session.expired` marks pending orders as failed.
5. Vendor balance is credited idempotently.

Fees:
- Platform fee: `15%`
- Vendor earning: `85%`
- Fee calculation lives in `lib/stripe.ts`.

Order statuses:
- `PENDING`
- `COMPLETED`
- `REFUNDED`
- `FAILED`

## Messaging
Messaging supports buyer/vendor threads with persisted history and Pusher events.

Core pieces:
- `MessageThreadModel`: unique buyer/vendor pair.
- `MessageModel`: message rows with sender, content, read flag, timestamps.
- `services/messaging.service.ts`: authorization, thread creation, fetch, send, and Pusher trigger.
- `components/messaging/messaging-ui.tsx`: client messaging interface.

Routes and actions:
- `/api/messages` supports authenticated GET and POST.
- `/api/pusher/auth` authorizes private Pusher subscriptions.
- `server/actions/message.actions.ts` exposes server-action equivalents.
- Buyer actions can create a thread by vendor user ID.

Pusher channels:
```txt
private-thread-{threadId}
```

Message sends are persisted first; Pusher broadcast is best effort.

## Uploads and Media
Cloudinary:
- Product thumbnails upload directly from the vendor product form.
- Helper: `lib/cloudinary.ts`.
- Accepted formats: PNG, JPG, WebP, GIF, AVIF.
- Max thumbnail size: 8 MB.
- URLs are stored as product `thumbnail`.

UploadThing:
- Route handler: `app/api/uploadthing/route.ts`.
- Router config: `app/api/uploadthing/core.ts`.
- `productFile`: vendor/admin only, accepts PDF, ZIP, and video up to 128 MB.
- `avatarImage`: authenticated users only, image up to 4 MB.

Next image config allows Cloudinary, UploadThing, Google avatars, GitHub avatars, and Picsum images.

## Email
Email is handled in `lib/email.ts` with Nodemailer.

Email types:
- Account verification email.
- Password reset email.

Transport behavior:
- Prefer `SMTP_URL` if present.
- Otherwise use `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS`.
- If SMTP config is missing, registration and password reset return actionable errors.
- Registration rolls back the created user/vendor profile if the verification email cannot be sent.

Gmail example:
```txt
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your@gmail.com
```

## Database
The app uses MongoDB through Mongoose models in `server/models`.

Main collections:
- `users`
- `accounts`
- `sessions`
- `app_verification_tokens`
- `vendor_profiles`
- `products`
- `orders`
- `reviews`
- `message_threads`
- `messages`
- `subscriptions`

There is no formal migration framework in this repo. Schema changes are represented by model updates and can be handled with one-off scripts if needed.

The seed script is:
```bash
npm run db:seed
```

## Security
Security controls currently implemented:
- JWT-based sessions with NextAuth.
- Role-based route protection in `proxy.ts`.
- Server action role guards.
- Same-origin validation for sensitive POST routes.
- Redis-backed rate limiting for checkout, messages, Pusher auth, and admin role changes.
- Safe Redis fallback if Redis is unavailable.
- Zod validation for forms, server actions, and API bodies.
- Stripe webhook signature verification.
- Security headers applied via proxy/Next config helpers.
- Password hashing with bcrypt.
- Email verification for credential accounts when SMTP is configured.

Rate limits currently include:
- Stripe checkout: 15 requests per user per minute.
- Message sending: 80 requests per user per minute.
- Pusher auth: 120 requests per user per minute.
- Admin role changes: 40 requests per admin per minute.

## Scripts
```bash
npm run dev       # Start Next.js dev server
npm run build     # Production build and type check through Next.js
npm run start     # Start production server after build
npm run lint      # ESLint
npm run db:seed   # Seed demo data using .env.local
```

## Validation
Recommended local checks before shipping:
```bash
npm run lint
npm run build
```

`npm run build` runs the Next.js production build and TypeScript checks.

Current lint may report warnings for unused imports/locals in older files, but should not fail on errors.

## Deployment
Vercel deployment checklist:
1. Import the repository into Vercel.
2. Set all production environment variables.
3. Set `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to the exact deployed origin with no trailing slash.
4. Add Google OAuth callback URL in Google Cloud Console.
5. Configure Stripe webhook endpoint:
```txt
https://<your-domain>/api/stripe/webhook
```
6. Store the resulting signing secret in `STRIPE_WEBHOOK_SECRET`.
7. Configure Cloudinary unsigned upload preset for product thumbnails.
8. Configure UploadThing token for product files and avatars.
9. Configure Pusher for real-time messaging.
10. Configure SMTP for registration and password reset email.
11. Optionally configure Redis/Upstash for rate limiting.

## Troubleshooting
### Build fails fetching Google Fonts
The app uses `next/font/google`. A production build needs network access to fetch fonts unless fonts are cached or replaced with local fonts.

### `REDIS_URL not set` or `REDIS_URL is invalid`
Redis is optional. Rate limiting opens safely when Redis is unavailable. Set a valid `REDIS_URL` for production.

### Pusher auth returns `503`
Server-side Pusher env vars are missing. Set `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, and `PUSHER_CLUSTER`.

### Messages persist but do not update live
Check Pusher server env vars, public Pusher env vars, cluster value, and browser console output.

### Stripe webhook signature mismatch
Confirm `STRIPE_WEBHOOK_SECRET` matches the exact endpoint currently posting to `/api/stripe/webhook`.

### Checkout creates pending orders but downloads do not appear
Confirm the webhook is receiving `checkout.session.completed` and the order finalization logs show the order was marked completed.

### Cloudinary upload fails
Check `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, the unsigned upload preset name, and Cloudinary preset restrictions. The browser must be allowed to upload images to that preset.

### UploadThing upload fails
Check `UPLOADTHING_TOKEN` and the authenticated user's role. Product file uploads require `VENDOR` or `ADMIN`; avatar uploads require any authenticated user.

### Email verification or reset fails
Check SMTP credentials. For Gmail, use an app password rather than your normal account password.

### OAuth callback issues
Check `NEXTAUTH_URL`, Google OAuth callback URL, and domain/protocol alignment.

### MongoDB connection issues
Confirm `MONGODB_URI`, Atlas network access, and database user permissions.

## Seed Data
`npm run db:seed` creates demo users and sample marketplace data.

Default seeded password:
```txt
Password123!
```

Default seeded accounts:
- `admin@quwahmarket-saas.com`
- `alex@quwahmarket-saas.com`
- `sarah@quwahmarket-saas.com`
- `marcus@quwahmarket-saas.com`
- `emily@quwahmarket-saas.com`
- `james@quwahmarket-saas.com`
- `priya@quwahmarket-saas.com`
- `tom@quwahmarket-saas.com`
- `lisa@quwahmarket-saas.com`

## Known Gaps
- No automated unit/integration/E2E test suite yet.
- No formal database migration framework.
- Vendor payout workflow is modeled through balances but not a complete Stripe Connect payout pipeline.
- Admin audit logs are not implemented.
- Some admin/dispute pages are dashboard surfaces and may need deeper workflow buildout.

