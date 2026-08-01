-- ============================================================================
-- Prime Ciné — Core Schema Migration
-- 0001_init.sql
-- Run this in the Supabase SQL editor, or via `supabase db push`.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.user_role as enum ('super_admin', 'admin', 'moderator', 'user');
create type public.content_type as enum ('movie', 'series', 'documentary', 'reality');
create type public.subscription_tier as enum ('free', 'standard', 'premium');
create type public.subscription_status as enum ('active', 'trialing', 'past_due', 'canceled', 'incomplete');

-- ----------------------------------------------------------------------------
-- profiles
-- One row per auth.users row. Created automatically by trigger on signup.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  username text unique,
  avatar_url text,
  role public.user_role not null default 'user',
  subscription_tier public.subscription_tier not null default 'free',
  preferred_language text not null default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Public profile + role/subscription data for each authenticated user.';

-- ----------------------------------------------------------------------------
-- genres
-- ----------------------------------------------------------------------------
create table public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

-- ----------------------------------------------------------------------------
-- titles (movies, series, documentaries, reality shows)
-- ----------------------------------------------------------------------------
create table public.titles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  original_title text,
  type public.content_type not null default 'movie',
  is_original boolean not null default false,
  is_published boolean not null default true,
  synopsis text not null default '',
  short_synopsis text not null default '',
  poster_url text,
  backdrop_url text,
  trailer_url text,
  video_url text,
  age_rating text not null default 'Tous publics',
  duration_minutes integer,
  duration_label text,
  release_year integer,
  release_date date,
  director text,
  language text not null default 'Français',
  country text not null default 'Cameroun',
  average_rating numeric(3, 1) not null default 0,
  ratings_count integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index titles_type_idx on public.titles (type);
create index titles_is_original_idx on public.titles (is_original);
create index titles_release_year_idx on public.titles (release_year);

-- ----------------------------------------------------------------------------
-- title_genres (many-to-many)
-- ----------------------------------------------------------------------------
create table public.title_genres (
  title_id uuid not null references public.titles (id) on delete cascade,
  genre_id uuid not null references public.genres (id) on delete cascade,
  primary key (title_id, genre_id)
);

-- ----------------------------------------------------------------------------
-- cast_members
-- ----------------------------------------------------------------------------
create table public.cast_members (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references public.titles (id) on delete cascade,
  name text not null,
  role_name text not null,
  photo_url text,
  sort_order integer not null default 0
);

create index cast_members_title_idx on public.cast_members (title_id);

-- ----------------------------------------------------------------------------
-- episodes (for series / reality / zero-couple)
-- ----------------------------------------------------------------------------
create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references public.titles (id) on delete cascade,
  season_number integer not null default 1,
  episode_number integer not null,
  title text not null,
  synopsis text not null default '',
  duration_minutes integer,
  thumbnail_url text,
  video_url text,
  release_date date,
  created_at timestamptz not null default now(),
  unique (title_id, season_number, episode_number)
);

create index episodes_title_idx on public.episodes (title_id);

-- ----------------------------------------------------------------------------
-- comments (with moderation)
-- ----------------------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references public.titles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  is_hidden boolean not null default false,
  hidden_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_title_idx on public.comments (title_id);
create index comments_user_idx on public.comments (user_id);

-- ----------------------------------------------------------------------------
-- ratings (1 per user per title, drives titles.average_rating)
-- ----------------------------------------------------------------------------
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references public.titles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  score smallint not null check (score between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (title_id, user_id)
);

-- ----------------------------------------------------------------------------
-- my_list (favorites / watchlist)
-- ----------------------------------------------------------------------------
create table public.my_list (
  user_id uuid not null references public.profiles (id) on delete cascade,
  title_id uuid not null references public.titles (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, title_id)
);

-- ----------------------------------------------------------------------------
-- watch_progress (continue watching)
-- ----------------------------------------------------------------------------
create table public.watch_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title_id uuid not null references public.titles (id) on delete cascade,
  episode_id uuid references public.episodes (id) on delete cascade,
  progress_seconds integer not null default 0,
  duration_seconds integer not null default 0,
  percent numeric(5, 2) not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, title_id, episode_id)
);

create index watch_progress_user_idx on public.watch_progress (user_id);

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, is_read);

-- ----------------------------------------------------------------------------
-- subscription_plans + user_subscriptions
-- ----------------------------------------------------------------------------
create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier public.subscription_tier not null,
  price_xaf integer not null,
  billing_period text not null default 'monthly',
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.subscription_plans (id),
  status public.subscription_status not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index user_subscriptions_user_idx on public.user_subscriptions (user_id);

-- ============================================================================
-- Functions & triggers
-- ============================================================================

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.titles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.comments
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.ratings
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth.users row appears
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)),
    new.raw_user_meta_data ->> 'avatar_url',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Recompute a title's average_rating/ratings_count whenever ratings change
create or replace function public.refresh_title_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_title uuid := coalesce(new.title_id, old.title_id);
begin
  update public.titles t
  set average_rating = coalesce((select round(avg(score), 1) from public.ratings where title_id = target_title), 0),
      ratings_count = (select count(*) from public.ratings where title_id = target_title)
  where t.id = target_title;
  return null;
end;
$$;

drop trigger if exists on_rating_change on public.ratings;
create trigger on_rating_change
  after insert or update or delete on public.ratings
  for each row execute function public.refresh_title_rating();

-- ----------------------------------------------------------------------------
-- Role-check helpers (SECURITY DEFINER so they can read profiles under RLS)
-- ----------------------------------------------------------------------------
create or replace function public.current_role()
returns public.user_role
language sql
security definer set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_moderator_or_above()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select role in ('moderator', 'admin', 'super_admin') from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_admin_or_above()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select role in ('admin', 'super_admin') from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select role = 'super_admin' from public.profiles where id = auth.uid()), false);
$$;
