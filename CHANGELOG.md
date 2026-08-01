# Changelog

All notable work on Prime Ciné, in the order it was built. This is a development changelog (not a semver release log) — each entry corresponds to a development phase/session.

## Phase 6 — Production hardening + Billing (in progress)

### Added
- SEO: `sitemap.ts`, `robots.ts`, `manifest.ts`, per-page metadata, dynamic OG/Twitter tags + JSON-LD on watch page, generated icon/OG image assets
- Accessibility: skip-to-content link, `role="alert"` on form errors across the app, focus-visible styles
- Security: CSP/HSTS/X-Frame-Options/Permissions-Policy headers, dynamic Supabase-domain image allowlisting (bug caught & fixed — uploaded images would have been blocked by `next/image` otherwise), open-redirect fix on login `next` param, best-effort in-memory rate limiting on auth + comments + checkout
- Error handling: root/`admin`/`watch` error boundaries, `global-error.tsx`, video player error+retry state
- Loading states: `Skeleton.tsx` primitives + `loading.tsx` on every major route
- Testing: Vitest + React Testing Library configured
- Payments: full MTN MoMo / Orange Money / CinetPay(card) integration — provider clients, 3 webhook routes with server-side status re-verification (anti-spoofing), service-role admin client, free-trial/cancel/resume RPCs, checkout modal + pricing page
- `0006_payments.sql` migration: transactions, invoices, trial support

### Fixed
- `next.config.js` image `remotePatterns` didn't include the Supabase storage domain — uploaded posters/backdrops/videos would have silently failed to render via `next/image`
- Login `next` redirect param was passed straight to `redirect()` — open-redirect risk, now validated as same-site relative path only

## Phase 5 — Admin: Movies, Series, Episodes, Video Player, User Library

### Added
- `VideoPlayer.tsx`: full custom HTML5 player (play/pause, seek, volume, fullscreen, skip ±10s, subtitle toggle, quality UI, next-episode overlay, progress persistence)
- `/watch/[slug]` page: player + info + cast + comments + ratings + recommendations
- Storage buckets + upload pipeline (`storage.ts`, `FileUploadField.tsx`) for posters/backdrops/thumbnails/videos/avatars
- Admin Movies & Series CRUD (`TitleForm.tsx`, list/new/edit pages) with genre multi-select and media upload
- `EpisodeManager.tsx` — full episode CRUD with per-episode video upload
- Real My List / Continue Watching / Watch History pages backed by `my_list` and `watch_progress` tables
- Genre-based recommendation engine (`getRecommendedTitles`)
- `0005_storage.sql` migration

## Phase 4 — Admin Dashboard shell + Users/Comments/Banners/Subscriptions/Notifications

### Added
- `/admin` layout, sidebar (desktop + mobile), role gate, analytics overview page
- Users management (search, role change, suspend) — `super_admin`-only role edits
- Administrators page (promote-by-email, `super_admin`-only)
- Comment moderation queue (hide/show/delete, filter tabs)
- Banner CRUD (not yet wired into public Hero)
- Subscription plan CRUD + subscriber list
- Notification composer (broadcast or single-user) + send history
- `0004_admin_extensions.sql` migration (`is_suspended`, `banners` table)

## Phase 3 — Supabase Backend: Schema, Auth, Roles, RLS

### Added
- `0001_init.sql` / `0002_rls.sql` / `0003_bootstrap_super_admin.sql`
- 4-tier role model (`user`/`moderator`/`admin`/`super_admin`) enforced via Postgres RLS
- Supabase Auth wiring: browser/server clients, middleware session refresh, server actions for signup/signin/signout
- Real My List toggle wired to database (previously local component state only)
- Home/Movies/Series pages switched from static demo data to live Supabase queries, with automatic fallback to static data if env vars are unset or a query fails

## Phase 2 — Frontend Foundation

### Added
- Next.js 15 + TypeScript + Tailwind + Framer Motion scaffold
- Design system: black/dark-gray/red/white palette, Fraunces + Inter typography, film-strip divider motif, ticket-stub card corners
- Navbar (sticky, animated logo, search, notifications icon, avatar dropdown), Footer
- Cinematic rotating Hero section
- `MovieCard` (hover animations, favorite/watch buttons, progress bar) + `MovieRow` (horizontal scroll with arrow nav)
- Home page with 10+ curated rows (Trending, New Releases, Originals, genre rows, etc.)
- Movies/Series listing pages, Login/Register pages, 404 page
- Static demo catalog including *Zéro Couple* (flagship original) with full cast/episodes/comments, used as both design-time fallback data and DB seed source

---

*For current unfinished work and the prioritized roadmap, see `CHECKPOINT.md`.*
