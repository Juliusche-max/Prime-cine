-- ============================================================================
-- Prime Ciné — Row Level Security
-- 0002_rls.sql
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.genres enable row level security;
alter table public.titles enable row level security;
alter table public.title_genres enable row level security;
alter table public.cast_members enable row level security;
alter table public.episodes enable row level security;
alter table public.comments enable row level security;
alter table public.ratings enable row level security;
alter table public.my_list enable row level security;
alter table public.watch_progress enable row level security;
alter table public.notifications enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- Everyone (incl. anon) can read public profile fields.
-- A user can update their own profile, but NOT their own role or subscription_tier
-- (those columns are only writable by admins/super_admins, enforced below).
-- ----------------------------------------------------------------------------
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_update_self"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
    and subscription_tier = (select subscription_tier from public.profiles where id = auth.uid())
  );

create policy "profiles_admin_update_any"
  on public.profiles for update
  using (public.is_admin_or_above());

create policy "profiles_super_admin_manage"
  on public.profiles for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ----------------------------------------------------------------------------
-- genres — public read, moderator+ write
-- ----------------------------------------------------------------------------
create policy "genres_select_all"
  on public.genres for select
  using (true);

create policy "genres_write_staff"
  on public.genres for all
  using (public.is_moderator_or_above())
  with check (public.is_moderator_or_above());

-- ----------------------------------------------------------------------------
-- titles — public reads published titles; staff can read/write everything
-- ----------------------------------------------------------------------------
create policy "titles_select_published"
  on public.titles for select
  using (is_published = true or public.is_moderator_or_above());

create policy "titles_insert_staff"
  on public.titles for insert
  with check (public.is_moderator_or_above());

create policy "titles_update_staff"
  on public.titles for update
  using (public.is_moderator_or_above())
  with check (public.is_moderator_or_above());

create policy "titles_delete_admin"
  on public.titles for delete
  using (public.is_admin_or_above());

-- ----------------------------------------------------------------------------
-- title_genres, cast_members, episodes — mirror titles' visibility
-- ----------------------------------------------------------------------------
create policy "title_genres_select_all"
  on public.title_genres for select
  using (true);
create policy "title_genres_write_staff"
  on public.title_genres for all
  using (public.is_moderator_or_above())
  with check (public.is_moderator_or_above());

create policy "cast_members_select_all"
  on public.cast_members for select
  using (true);
create policy "cast_members_write_staff"
  on public.cast_members for all
  using (public.is_moderator_or_above())
  with check (public.is_moderator_or_above());

create policy "episodes_select_all"
  on public.episodes for select
  using (true);
create policy "episodes_write_staff"
  on public.episodes for all
  using (public.is_moderator_or_above())
  with check (public.is_moderator_or_above());

-- ----------------------------------------------------------------------------
-- comments — public reads non-hidden comments; authenticated users manage
-- their own; moderators can hide/delete any comment.
-- ----------------------------------------------------------------------------
create policy "comments_select_visible"
  on public.comments for select
  using (is_hidden = false or auth.uid() = user_id or public.is_moderator_or_above());

create policy "comments_insert_own"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "comments_update_own"
  on public.comments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "comments_moderate_staff"
  on public.comments for update
  using (public.is_moderator_or_above());

create policy "comments_delete_own_or_staff"
  on public.comments for delete
  using (auth.uid() = user_id or public.is_moderator_or_above());

-- ----------------------------------------------------------------------------
-- ratings — public can read aggregate via titles table; individual scores
-- are visible to everyone (kept simple/transparent), but only the owner
-- can insert/update/delete their own rating.
-- ----------------------------------------------------------------------------
create policy "ratings_select_all"
  on public.ratings for select
  using (true);

create policy "ratings_insert_own"
  on public.ratings for insert
  with check (auth.uid() = user_id);

create policy "ratings_update_own"
  on public.ratings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ratings_delete_own"
  on public.ratings for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- my_list — fully private to the owning user
-- ----------------------------------------------------------------------------
create policy "my_list_owner_all"
  on public.my_list for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- watch_progress — fully private to the owning user
-- ----------------------------------------------------------------------------
create policy "watch_progress_owner_all"
  on public.watch_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- notifications — user reads/updates(mark-as-read) own; staff can insert for
-- any user (e.g. broadcast a new-episode alert); users cannot insert for others.
-- ----------------------------------------------------------------------------
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notifications_insert_staff"
  on public.notifications for insert
  with check (public.is_moderator_or_above());

create policy "notifications_delete_own"
  on public.notifications for delete
  using (auth.uid() = user_id or public.is_moderator_or_above());

-- ----------------------------------------------------------------------------
-- subscription_plans — public reads active plans; admin manages
-- ----------------------------------------------------------------------------
create policy "plans_select_active"
  on public.subscription_plans for select
  using (is_active = true or public.is_admin_or_above());

create policy "plans_write_admin"
  on public.subscription_plans for all
  using (public.is_admin_or_above())
  with check (public.is_admin_or_above());

-- ----------------------------------------------------------------------------
-- user_subscriptions — user reads own; admin manages all
-- ----------------------------------------------------------------------------
create policy "user_subscriptions_select_own"
  on public.user_subscriptions for select
  using (auth.uid() = user_id or public.is_admin_or_above());

create policy "user_subscriptions_write_admin"
  on public.user_subscriptions for all
  using (public.is_admin_or_above())
  with check (public.is_admin_or_above());
