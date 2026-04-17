# quwahmarket-saas Quickstart

Fast setup guide for local development.

For full architecture and operational docs, see [README.md](./README.md).

## 1. Prerequisites
- Node.js 18+ (or 20+ recommended)
- npm
- MongoDB database (local or Atlas)

## 2. Install
```bash
npm install
```

## 3. Configure environment
Copy the example env file and fill required values:

```bash
cp .env.example .env.local
```

Minimum required for local app boot:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (if using Google login)
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `EMAIL_FROM`
- `SMTP_URL` or `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `PUSHER_APP_ID`
- `PUSHER_KEY`
- `PUSHER_SECRET`
- `PUSHER_CLUSTER`
- `NEXT_PUBLIC_PUSHER_KEY`
- `NEXT_PUBLIC_PUSHER_CLUSTER`
- `UPLOADTHING_SECRET`
- `UPLOADTHING_APP_ID`

Optional:
- `REDIS_URL` (rate limiting/caching). If missing/invalid, app still runs.

For Gmail SMTP, use:
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`
- `SMTP_USER=your@gmail.com`
- `SMTP_PASS=your Gmail App Password`
- `EMAIL_FROM=your@gmail.com`

## 4. Database
Optional seed:

```bash
npm run db:seed
```

## 5. Run app
```bash
npm run dev
```

Open `http://localhost:3000`.

## 6. Validate
```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Useful Commands
```bash
npm run db:seed
```

## Seed Accounts (if seeded)
Password: `Password123!`
- `admin@quwahmarket-saas.com`
- `alex@quwahmarket-saas.com`
- `sarah@quwahmarket-saas.com`
- `marcus@quwahmarket-saas.com`
- `emily@quwahmarket-saas.com`
- `james@quwahmarket-saas.com`
- `priya@quwahmarket-saas.com`
- `tom@quwahmarket-saas.com`
- `lisa@quwahmarket-saas.com`


