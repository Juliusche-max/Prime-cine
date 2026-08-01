-- ============================================================================
-- Prime Ciné — Admin Dashboard extensions
-- 0004_admin_extensions.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: add suspension flag (admins can disable an account without
-- deleting it; enforced in the app layer at sign-in/middleware level)
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_suspended boolean not null default false;

-- Re-create the self-update policy so a user cannot lift their own
-- suspension or touch is_suspended, in addition to role/subscription_tier.
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
    and subscription_tier = (select subscription_tier from public.profiles where id = auth.uid())
    and is_suspended = (select is_suspended from public.profiles where id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- banners — homepage / promotional banners managed from the admin dashboard
-- ----------------------------------------------------------------------------
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  heading text not null,
  subheading text not null default '',
  image_url text not null,
  cta_label text not null default 'Regarder',
  title_id uuid references public.titles (id) on delete set null,
  external_link text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.banners
  for each row execute function public.set_updated_at();

alter table public.banners enable row level security;

create policy "banners_select_active"
  on public.banners for select
  using (is_active = true or public.is_moderator_or_above());

create policy "banners_write_staff"
  on public.banners for all
  using (public.is_moderator_or_above())
  with check (public.is_moderator_or_above());

-- ----------------------------------------------------------------------------
-- notifications: allow a moderator+ to insert one row per recipient in a
-- single statement (broadcast). The existing "notifications_insert_staff"
-- policy from 0002_rls.sql already covers this (with check is_moderator_or_above()),
-- since RLS is evaluated per-row regardless of batch size — no change needed.
-- Kept here as documentation.
-- ----------------------------------------------------------------------------
