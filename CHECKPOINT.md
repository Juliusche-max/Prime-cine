# Prime Ciné — Project Checkpoint

**Date:** Checkpoint taken mid-development, production-hardening + billing phase.
**Purpose:** This document lets development continue in a fresh chat with zero lost context. Read this before touching code.

---

## 1. What Prime Ciné is

A real (not demo) streaming platform for 100% Cameroonian film/series/reality content, built with:
- **Frontend:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Supabase (Postgres + Auth + Storage + RLS)
- **Payments:** MTN Mobile Money, Orange Money, CinetPay (cards) — real API integrations, not mocks
- **Target deploy:** Vercel

Design identity: black/dark-gray/red/white, Fraunces display serif + Inter, a "film-strip perforation" signature divider, ticket-stub card corners — intentionally not a Netflix clone.

---

## 2. Completed features (functional, code-complete)

### Public site
- Home page: animated hero (rotating featured titles), genre/curated rows, personalized "Recommended for you" row for logged-in users
- Movies / Series listing pages (grid, live from DB)
- Watch page (`/watch/[slug]`): video player, cast, synopsis, genres, rating widget, comments, "titles similaires" row, JSON-LD structured data, dynamic per-title `<meta>` tags
- My List, Continue Watching, Watch History — all real, per-user, RLS-protected
- Pricing page with 3 plan cards → checkout modal
- Login / Register (Supabase Auth, Server Actions, rate-limited)
- 404 page, root + section-level error boundaries, loading skeletons on every major route

### Video player (`components/player/VideoPlayer.tsx`)
Custom HTML5-based player: play/pause, seek bar with buffered indicator, volume, mute, fullscreen, ±10s skip, subtitle track toggle (needs a real VTT file to show text), quality selector UI (cosmetic — no multi-bitrate source yet), auto-next-episode overlay, resume-from-saved-position, periodic progress persistence (`watch_progress` table) every 10s + on pause/unmount, video-load error state with retry.

### Auth & roles
- Supabase Auth (email/password) via `@supabase/ssr`, server actions for signUp/signIn/signOut
- 4 roles: `user`, `moderator`, `admin`, `super_admin` — enforced in Postgres via RLS, not just UI
- `middleware.ts` refreshes sessions and gate-keeps `/admin/*`
- Bootstrap process for the first `super_admin` documented (can't self-grant, by design)

### Admin dashboard (`/admin/*`, role-gated)
Full shell (`app/admin/layout.tsx` + sidebar + mobile nav) plus:
| Route | Purpose |
|---|---|
| `/admin` | Analytics overview: user/title/comment/rating counts, signups-by-day bar chart, catalog breakdown, top-rated titles, role breakdown, recent comments |
| `/admin/movies`, `/admin/movies/new`, `/admin/movies/[id]/edit` | Movie CRUD with poster/backdrop/video upload |
| `/admin/series`, `.../new`, `.../[id]/edit` | Series CRUD + full episode manager (add/edit/delete episodes, per-episode video/thumbnail upload) |
| `/admin/users` | List, search, role change (super_admin only), suspend/reactivate |
| `/admin/administrators` | super_admin-only: promote existing user by email to moderator/admin/super_admin |
| `/admin/comments` | Moderation queue: filter all/visible/hidden, hide/show/delete |
| `/admin/banners` + `new` + `[id]/edit` | Promotional banner CRUD (not yet wired into the public Hero — see Unfinished) |
| `/admin/subscriptions` | Subscription plan CRUD + list of active subscribers |
| `/admin/notifications` | Compose + send broadcast or single-user notification, view send history |

### File uploads
`lib/supabase/storage.ts` (client-side XHR upload w/ progress) + `components/admin/FileUploadField.tsx`, wired into movie/series/episode/banner forms. 5 Storage buckets (posters, backdrops, thumbnails, avatars, videos) with RLS (public read, moderator+ write, users manage their own avatar folder).

### Payments & subscriptions (newest phase)
Real provider integrations (not mocked), see `lib/payments/`:
- **MTN MoMo** (`mtn.ts`) — Collections API, request-to-pay + status polling
- **Orange Money** (`orange.ts`) — Web Payment API, hosted redirect + status check
- **CinetPay** (`cinetpay.ts`) — used specifically for **card** payments via hosted checkout (deliberately not building our own card form — PCI scope)
- 3 webhook routes (`app/api/webhooks/{mtn,orange,cinetpay}/route.ts`) that **re-verify status server-side** with the provider rather than trusting the callback payload (spoofing protection)
- `lib/supabase/admin-client.ts` — service-role Supabase client, webhook-only, bypasses RLS to activate subscriptions + issue invoices
- Free trial via a `SECURITY DEFINER` Postgres RPC (`start_free_trial`) — prevents trial abuse, no client-writable path to grant yourself an active subscription
- `cancel_my_subscription` / `resume_my_subscription` RPCs — narrow, safe self-service (users can only flip `cancel_at_period_end`, never plan/status/amount)
- `components/billing/PlanCard.tsx` + `CheckoutModal.tsx` — method picker (MoMo/Orange/Card), phone input, polling UI, redirect handling
- `app/pricing/page.tsx` — live from `subscription_plans`

### Production hardening (in progress this phase)
- **SEO:** `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, per-page `metadata` exports, dynamic OG/Twitter tags on watch page, JSON-LD, generated icon/OG assets in `/public`
- **Accessibility:** skip-to-content link, `role="alert"` on all inline form errors, focus-visible outlines (global CSS), aria-labels throughout nav/player/cards
- **Security:** CSP + HSTS + X-Frame-Options + Permissions-Policy headers in `next.config.js` (with dynamic Supabase image-domain allowlisting — this was a real bug caught and fixed), open-redirect fix on the `next` login param, in-memory rate limiting (`lib/rate-limit.ts`, documented as best-effort/single-instance — real deployments should swap to Upstash) on signup/signin/comments/checkout
- **Error handling:** `error.tsx` at root, `/admin`, `/watch/[id]`, plus `global-error.tsx`; video player has its own error+retry state
- **Loading states:** `components/ui/Skeleton.tsx` primitives + `loading.tsx` on home/movies/series/my-list/continue-watching/history/watch/admin
- **Testing:** Vitest + RTL configured (`vitest.config.ts`, `vitest.setup.ts`, scripts in `package.json`) — **test files themselves not yet written**, see Unfinished
- **Deployment:** none yet — see Unfinished

---

## 3. Full file/folder map

```
prime-cine/
├── app/
│   ├── layout.tsx, page.tsx, loading.tsx, error.tsx, global-error.tsx, not-found.tsx
│   ├── globals.css, sitemap.ts, robots.ts, manifest.ts
│   ├── admin/
│   │   ├── layout.tsx, page.tsx, loading.tsx, error.tsx
│   │   ├── movies/ (page, new/, [id]/edit/)
│   │   ├── series/ (page, new/, [id]/edit/)
│   │   ├── users/page.tsx, administrators/page.tsx
│   │   ├── comments/page.tsx, banners/ (page, new/, [id]/edit/)
│   │   ├── subscriptions/page.tsx, notifications/page.tsx
│   ├── api/webhooks/{mtn,orange,cinetpay}/route.ts
│   ├── watch/[id]/ (page, loading, error)
│   ├── movies/, series/ (page + loading)
│   ├── my-list/, continue-watching/, history/ (page + loading)
│   ├── login/, register/, pricing/
│   ├── settings/          ← EMPTY, next task
│   └── invoices/[id]/     ← EMPTY, next task
├── components/
│   ├── layout/ (Navbar server+client split, Footer, SiteChrome)
│   ├── home/ (Hero, MovieRow)
│   ├── ui/ (Button, MovieCard, TitleGrid, PageHeader, FilmDivider, Skeleton)
│   ├── auth/ (LoginForm, RegisterForm)
│   ├── watch/ (CommentSection, RatingWidget, MyListButton, WatchPageClient)
│   ├── player/VideoPlayer.tsx
│   ├── billing/ (PlanCard, CheckoutModal)
│   └── admin/ (Sidebar×2, MobileNav, PageHeader, TitleForm, EpisodeManager,
│               FileUploadField, DeleteButton, UserRow, PromoteForm,
│               CommentModerationRow, BannerForm, PlanCard, NewPlanForm,
│               NotificationComposer)
├── lib/
│   ├── types.ts, data.ts (static fallback catalog), utils.ts (cn, slugify)
│   ├── rate-limit.ts
│   ├── payments/ (types, mtn, orange, cinetpay, finalize)
│   └── supabase/
│       ├── client.ts, server.ts, middleware.ts, admin-client.ts (service role)
│       ├── database.types.ts (hand-written, matches SQL schema)
│       ├── queries.ts (public reads + fallback-to-static-data pattern)
│       ├── admin-queries.ts, admin-actions.ts
│       ├── auth-actions.ts, content-actions.ts
│       └── billing-queries.ts, payment-actions.ts
├── supabase/
│   ├── migrations/0001_init.sql … 0006_payments.sql
│   └── seed.sql
├── public/ (generated icons + og-image)
├── middleware.ts (root — delegates to lib/supabase/middleware.ts)
├── next.config.js (security headers, image domains)
├── vitest.config.ts, vitest.setup.ts
├── tailwind.config.ts, tsconfig.json, package.json
├── .env.example
└── README.md
```

---

## 4. Database schema (6 migrations, run in order)

1. **`0001_init.sql`** — enums (`user_role`, `content_type`, `subscription_tier`, `subscription_status`), core tables (`profiles`, `genres`, `titles`, `title_genres`, `cast_members`, `episodes`, `comments`, `ratings`, `my_list`, `watch_progress`, `notifications`, `subscription_plans`, `user_subscriptions`), triggers (auto-profile-on-signup, auto-recompute rating), role-check helper functions
2. **`0002_rls.sql`** — RLS policies for every table above
3. **`0003_bootstrap_super_admin.sql`** — manual one-time SQL to promote the first super_admin
4. **`0004_admin_extensions.sql`** — `profiles.is_suspended`, `banners` table + RLS
5. **`0005_storage.sql`** — 5 Storage buckets + RLS (public read, moderator+ write, own-avatar)
6. **`0006_payments.sql`** — `payment_provider`/`transaction_status`/`invoice_status` enums, `subscription_plans.trial_days`, `user_subscriptions` payment/trial columns, `payment_transactions` table, `invoices` table + sequential invoice numbers, RLS, and 3 `SECURITY DEFINER` RPCs: `start_free_trial`, `cancel_my_subscription`, `resume_my_subscription`

**Role model:** `user` → `moderator` (content CRUD, comment moderation) → `admin` (+ delete content, manage plans) → `super_admin` (+ change anyone's role). All enforced at the Postgres level.

**Critical manual step users must not skip:** `SUPABASE_SERVICE_ROLE_KEY` must be set for payment webhooks to work (they use `admin-client.ts`). This key must never get a `NEXT_PUBLIC_` prefix.

---

## 5. Unfinished tasks (in priority order)

**Completed since the checkpoint was first written** (kept here, struck through, for history):
1. ~~`app/settings/page.tsx`~~ — done: profile info, subscription status/trial/renewal, cancel/resume controls, invoice list
2. ~~`app/invoices/[id]/page.tsx`~~ — done: printable invoice (HTML + `window.print()`)
3. ~~`.env.example` payment vars~~ — done: MTN/Orange/CinetPay/service-role/site-url all added
4. ~~Test files~~ — done: `lib/__tests__/utils.test.ts`, `rate-limit.test.ts`, `lib/payments/__tests__/types.test.ts`, `components/ui/__tests__/Button.test.tsx`, plus `playwright.config.ts` + `e2e/smoke.spec.ts`
5. ~~`vercel.json`~~ — done

**Still open:**
1. **Wire the `banners` table into the public Hero.** Admin CRUD exists (`/admin/banners`) but `components/home/Hero.tsx` still only rotates through `Title` objects, not `banners` rows. Needs: a `getActiveBanners()` query in `lib/supabase/queries.ts`, and either (a) a small `Slide` union type Hero can render for both cases, or (b) a separate `PromoBanner` component shown above/below Hero. Do (a) if banners need the same full-bleed treatment as titles; (b) is less code.
2. **Pages that were in the original spec but never built:** About, Contact, Categories, Search, a dedicated Zero Couple landing page, a separate Profile page (currently folded into Settings), and real content in the navbar's notification bell dropdown (currently a static "3" badge with no dropdown list — `notifications` table + `getMyNotifications()` query would back this). None of these block core functionality; build only if asked.
3. **CI.** No GitHub Actions workflow yet to run `npm run typecheck && npm run test` on PRs. Straightforward to add (`.github/workflows/ci.yml`) once the repo is pushed to a real Git host.
4. **Real multi-bitrate video.** The player's quality selector is currently cosmetic (no actual adaptive streaming / multiple renditions). Would need a transcoding pipeline (e.g., Mux, Cloudflare Stream, or a custom ffmpeg job) — out of scope for a Supabase-Storage-only setup.
5. **Distributed rate limiting.** `lib/rate-limit.ts` is explicitly documented as best-effort/single-instance. Swap for Upstash Redis + `@upstash/ratelimit` before relying on it in a real multi-region Vercel deployment.

---

## 6. How to resume work in a new chat

Paste this whole file back to Claude, plus: *"Continue from CHECKPOINT.md — task 1 is `app/settings/page.tsx`."* All server actions/queries needed for remaining tasks already exist; most remaining work is UI assembly, not new backend logic.
