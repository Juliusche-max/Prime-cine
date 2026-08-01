# Prime Ciné

Plateforme de streaming dédiée au cinéma 100% camerounais — films, séries, documentaires
et télé-réalité (dont *Zéro Couple*). Built as a real product, not a demo: real Supabase
backend with RLS-enforced roles, real file uploads, a real admin dashboard, and real
MTN Mobile Money / Orange Money / card payment integrations.

**New to this project?** Read `CHECKPOINT.md` for a full state-of-the-project summary and
`CHANGELOG.md` for how it got here. This README only covers running/developing/deploying.

## Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Postgres + Auth + Storage + Row Level Security)
- **Payments**: MTN Mobile Money, Orange Money, CinetPay (cards)
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel

## 1. Install dependencies

```bash
npm install
```

## 2. Create a Supabase project

1. Go to https://supabase.com/dashboard and create a new project.
2. In **Project Settings → API**, copy the **Project URL**, **anon public key**, and
   **service_role key** (keep the service role key secret — never expose it to the browser).
3. Copy `.env.example` to `.env.local` and fill in every value:

```bash
cp .env.example .env.local
```

## 3. Run the database migrations

In the Supabase Dashboard, open the **SQL Editor** and run the files in `supabase/migrations/`
**in numeric order** — each one depends on the last:

1. `0001_init.sql` — enums, core tables, functions, triggers
2. `0002_rls.sql` — Row Level Security policies for every core table
3. Sign up for an account in the running app (or via the Supabase Auth UI) so a `profiles` row exists
4. `0003_bootstrap_super_admin.sql` — edit the placeholder email to your account's, then run it.
   This is the **only** step that needs to touch the database directly; every other role change
   happens through `/admin` afterward.
5. `0004_admin_extensions.sql` — user suspension flag, banners table
6. `0005_storage.sql` — creates the 5 Storage buckets (posters/backdrops/thumbnails/avatars/videos) + RLS
7. `0006_payments.sql` — payment transactions, invoices, trial support, billing RPCs

Optionally run `supabase/seed.sql` to populate the catalog with the same demo titles
(including *Zéro Couple*) used throughout the design.

## 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`. Visit `/admin` once you're a super_admin to see the dashboard.

## 5. Testing

```bash
npm run test        # run unit tests once
npm run test:watch  # watch mode
npm run typecheck   # tsc --noEmit
```

## 6. Setting up payments (optional for local dev, required for real transactions)

Each provider needs its own developer account. All variables go in `.env.local` (and in your
Vercel project's Environment Variables for production):

**MTN Mobile Money** — https://momodeveloper.mtn.com
- Subscribe to the "Collections" product, create an API user + API key in the sandbox
- Set `MTN_MOMO_SUBSCRIPTION_KEY`, `MTN_MOMO_API_USER`, `MTN_MOMO_API_KEY`, `MTN_MOMO_ENV=sandbox`,
  `MTN_MOMO_TARGET_ENVIRONMENT=sandbox`
- Register your webhook: `https://<your-domain>/api/webhooks/mtn` as `MTN_MOMO_CALLBACK_URL`

**Orange Money** — https://developer.orange.com (Orange Money Web Payment CM)
- Set `ORANGE_MONEY_CLIENT_ID`, `ORANGE_MONEY_CLIENT_SECRET`, `ORANGE_MONEY_MERCHANT_KEY`
- Set `ORANGE_MONEY_RETURN_URL` / `ORANGE_MONEY_CANCEL_URL` to real pages on your domain
- Set `ORANGE_MONEY_NOTIF_URL=https://<your-domain>/api/webhooks/orange`

**CinetPay** (used for card payments) — https://cinetpay.com
- Set `CINETPAY_API_KEY`, `CINETPAY_SITE_ID`
- Set `CINETPAY_NOTIFY_URL=https://<your-domain>/api/webhooks/cinetpay`, `CINETPAY_RETURN_URL`

All three webhook routes **re-verify the payment status directly with the provider** rather than
trusting the webhook payload — this means a forged POST to those URLs can't fake a successful
payment. See `lib/payments/finalize.ts` for the activation logic (subscription + invoice creation),
which runs with the Supabase **service role** key and therefore bypasses RLS — this is intentional
and is the only place in the codebase that does so.

Without provider credentials configured, the pricing page and free trial still work; only the
MoMo/Orange/Card checkout buttons will return a clear error instead of crashing.

## 7. Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Add every variable from `.env.example` in **Project Settings → Environment Variables**
   (including `SUPABASE_SERVICE_ROLE_KEY` — mark it as a "Sensitive"/server-only value).
3. Set `NEXT_PUBLIC_SITE_URL` to your production URL (used by `sitemap.ts`/`robots.ts`/metadata).
4. Deploy. Vercel auto-detects Next.js — no custom build command needed.
5. In Supabase → **Authentication → URL Configuration**, add your Vercel domain to the
   **Site URL** and **Redirect URLs** allowlist, or email confirmation / password reset links
   will point at `localhost`.
6. Re-register each payment provider's webhook/return URLs with your real production domain
   (see section 6) — sandbox URLs won't work in production.
7. Security headers (CSP/HSTS/etc.) are already configured in `next.config.js` and apply
   automatically on Vercel.

## User roles

| Role          | Can do                                                                 |
|---------------|-------------------------------------------------------------------------|
| `user`        | Browse, rate, comment, manage their own list/history, subscribe/pay     |
| `moderator`   | + create/edit titles & episodes, moderate comments, manage banners      |
| `admin`       | + delete titles, manage subscription plans, suspend users               |
| `super_admin` | + change any user's role, promote administrators                        |

All of this is enforced at the database level via Row Level Security
(`supabase/migrations/0002_rls.sql`, `0004_admin_extensions.sql`, `0006_payments.sql`) — it holds
even if someone calls the Supabase API directly, not just through the UI.

## Folder structure

See `CHECKPOINT.md` section 3 for the full annotated file map — it's kept up to date as the
project grows, so it's a better source of truth than duplicating it here.

## Notes on data fetching

Every read in `lib/supabase/queries.ts` **falls back to the static demo catalog** in `lib/data.ts`
if `NEXT_PUBLIC_SUPABASE_URL` isn't set or a query fails — so the frontend keeps working and
looking finished even before a Supabase project is connected. Once env vars are set and
migrations are run, pages automatically switch to live data with zero UI changes.
