-- ============================================================================
-- Prime Ciné — Bootstrap the first Super Admin
-- 0003_bootstrap_super_admin.sql
--
-- RLS intentionally only allows a super_admin to grant roles — which means
-- the very first super_admin can't be created through the app. Run this
-- ONCE manually from the Supabase SQL editor (which executes as the
-- postgres/service role and bypasses RLS) after your own account exists.
--
-- Replace the email below with the account that should become super_admin.
-- ============================================================================

update public.profiles
set role = 'super_admin'
where id = (select id from auth.users where email = 'admin@primecine.cm');

-- To promote someone to 'admin' or 'moderator' afterwards, sign in as a
-- super_admin in the app and use the /admin dashboard, or run e.g.:
-- update public.profiles set role = 'moderator' where username = 'someuser';
