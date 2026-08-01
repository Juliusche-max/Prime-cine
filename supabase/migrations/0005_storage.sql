-- ============================================================================
-- Prime Ciné — Storage buckets for uploads
-- 0005_storage.sql
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('posters', 'posters', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('backdrops', 'backdrops', true, 8388608, array['image/png','image/jpeg','image/webp']),
  ('thumbnails', 'thumbnails', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/png','image/jpeg','image/webp']),
  -- Videos are public-read for simplicity in this build. In production, swap
  -- to a private bucket + signed URLs gated by subscription_tier so playback
  -- can't be hot-linked or watched without an active subscription.
  ('videos', 'videos', true, 5368709120, array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Public can read every bucket (they're all marked public above, but we
-- still declare explicit SELECT policies for clarity/auditability).
-- Only moderator+ can upload/replace/delete, except avatars which any
-- authenticated user manages for themselves.
-- ----------------------------------------------------------------------------
create policy "public_read_posters" on storage.objects for select using (bucket_id = 'posters');
create policy "public_read_backdrops" on storage.objects for select using (bucket_id = 'backdrops');
create policy "public_read_thumbnails" on storage.objects for select using (bucket_id = 'thumbnails');
create policy "public_read_avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "public_read_videos" on storage.objects for select using (bucket_id = 'videos');

create policy "staff_write_posters" on storage.objects for all
  using (bucket_id = 'posters' and public.is_moderator_or_above())
  with check (bucket_id = 'posters' and public.is_moderator_or_above());

create policy "staff_write_backdrops" on storage.objects for all
  using (bucket_id = 'backdrops' and public.is_moderator_or_above())
  with check (bucket_id = 'backdrops' and public.is_moderator_or_above());

create policy "staff_write_thumbnails" on storage.objects for all
  using (bucket_id = 'thumbnails' and public.is_moderator_or_above())
  with check (bucket_id = 'thumbnails' and public.is_moderator_or_above());

create policy "staff_write_videos" on storage.objects for all
  using (bucket_id = 'videos' and public.is_moderator_or_above())
  with check (bucket_id = 'videos' and public.is_moderator_or_above());

-- Users manage their own avatar, stored at avatars/{user_id}/...
create policy "user_write_own_avatar" on storage.objects for all
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
