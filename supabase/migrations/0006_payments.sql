-- ============================================================================
-- Prime Ciné — Billing & Payments
-- 0006_payments.sql
-- ============================================================================

create type public.payment_provider as enum ('mtn_momo', 'orange_money', 'cinetpay_card');
create type public.transaction_status as enum ('pending', 'successful', 'failed', 'cancelled', 'refunded');
create type public.invoice_status as enum ('paid', 'unpaid', 'void');

-- ----------------------------------------------------------------------------
-- subscription_plans: add trial support
-- ----------------------------------------------------------------------------
alter table public.subscription_plans
  add column if not exists trial_days integer not null default 0;

-- ----------------------------------------------------------------------------
-- user_subscriptions: add payment/trial/cancellation metadata
-- ----------------------------------------------------------------------------
alter table public.user_subscriptions
  add column if not exists payment_method public.payment_provider,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists started_at timestamptz not null default now();

-- A user should only have one "current" subscription row that matters; we
-- still allow historical rows (e.g. after a plan change) but the app always
-- reads the most recent one by created_at.

-- ----------------------------------------------------------------------------
-- payment_transactions — every attempt to charge a user, by any provider
-- ----------------------------------------------------------------------------
create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.subscription_plans (id),
  subscription_id uuid references public.user_subscriptions (id) on delete set null,
  provider public.payment_provider not null,
  amount_xaf integer not null,
  currency text not null default 'XAF',
  status public.transaction_status not null default 'pending',
  phone_number text,
  provider_reference text,
  provider_raw_response jsonb,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_transactions_user_idx on public.payment_transactions (user_id);
create index payment_transactions_status_idx on public.payment_transactions (status);
create unique index payment_transactions_provider_ref_idx on public.payment_transactions (provider, provider_reference) where provider_reference is not null;

create trigger set_updated_at before update on public.payment_transactions
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- invoices — one per successful transaction (or per free-trial start,
-- amount 0), which the user can view/print from their account.
-- ----------------------------------------------------------------------------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subscription_id uuid references public.user_subscriptions (id) on delete set null,
  transaction_id uuid references public.payment_transactions (id) on delete set null,
  invoice_number text not null unique,
  amount_xaf integer not null,
  status public.invoice_status not null default 'unpaid',
  plan_name text not null,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index invoices_user_idx on public.invoices (user_id);

-- Sequential, human-readable invoice numbers: PC-2026-000123
create sequence if not exists public.invoice_number_seq;

create or replace function public.generate_invoice_number()
returns text
language sql
as $$
  select 'PC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text, 6, '0');
$$;

-- ----------------------------------------------------------------------------
-- user_subscriptions: allow self-service trial start / checkout initiation
-- and self-service cancellation, without letting a user grant themselves an
-- active paid subscription (that only happens via the service-role webhook).
-- ----------------------------------------------------------------------------
-- Paid subscriptions are only ever created/activated by the service-role
-- webhook handler after a provider confirms payment (see app/api/webhooks/*).
-- Free trials go through the start_free_trial() RPC above. Regular users
-- therefore have no direct INSERT policy on this table.
-- direct UPDATE policy, so a user can only ever flip this one flag on
-- their own subscription and can never touch plan_id/status/amounts.
create or replace function public.cancel_my_subscription(target_subscription_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.user_subscriptions
  set cancel_at_period_end = true
  where id = target_subscription_id and user_id = auth.uid();
end;
$$;

create or replace function public.resume_my_subscription(target_subscription_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.user_subscriptions
  set cancel_at_period_end = false
  where id = target_subscription_id and user_id = auth.uid();
end;
$$;

-- ----------------------------------------------------------------------------
-- Free trial self-service: a single safe RPC so the app never has to grant
-- a user direct INSERT-with-active-status rights. Refuses to grant a second
-- trial of the same plan to the same user.
-- ----------------------------------------------------------------------------
create or replace function public.start_free_trial(target_plan_id uuid)
returns public.user_subscriptions
language plpgsql
security definer set search_path = public
as $$
declare
  v_plan public.subscription_plans;
  v_existing int;
  v_sub public.user_subscriptions;
begin
  select * into v_plan from public.subscription_plans where id = target_plan_id and is_active = true;
  if not found then
    raise exception 'Plan introuvable ou inactif';
  end if;
  if v_plan.trial_days <= 0 then
    raise exception 'Ce plan ne propose pas d''essai gratuit';
  end if;

  select count(*) into v_existing
  from public.user_subscriptions
  where user_id = auth.uid() and plan_id = target_plan_id;
  if v_existing > 0 then
    raise exception 'Vous avez déjà utilisé un essai gratuit pour ce plan';
  end if;

  insert into public.user_subscriptions (user_id, plan_id, status, trial_ends_at, current_period_end)
  values (auth.uid(), target_plan_id, 'trialing', now() + (v_plan.trial_days || ' days')::interval, now() + (v_plan.trial_days || ' days')::interval)
  returning * into v_sub;

  insert into public.invoices (user_id, subscription_id, invoice_number, amount_xaf, status, plan_name, issued_at)
  values (auth.uid(), v_sub.id, public.generate_invoice_number(), 0, 'paid', v_plan.name || ' (Essai gratuit)', now());

  return v_sub;
end;
$$;

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.payment_transactions enable row level security;
alter table public.invoices enable row level security;

-- Users can see their own transactions; staff can see all.
create policy "transactions_select_own"
  on public.payment_transactions for select
  using (auth.uid() = user_id or public.is_admin_or_above());

-- Users can create a *pending* transaction for themselves (payment
-- initiation). They can never set it to successful/failed directly —
-- only the service-role webhook handler (which bypasses RLS) can do that.
create policy "transactions_insert_own_pending"
  on public.payment_transactions for insert
  with check (auth.uid() = user_id and status = 'pending');

create policy "transactions_admin_manage"
  on public.payment_transactions for update
  using (public.is_admin_or_above())
  with check (public.is_admin_or_above());

-- Invoices are read-only from the app's perspective (created by the
-- webhook handler via service role); users can only read their own.
create policy "invoices_select_own"
  on public.invoices for select
  using (auth.uid() = user_id or public.is_admin_or_above());

create policy "invoices_admin_manage"
  on public.invoices for all
  using (public.is_admin_or_above())
  with check (public.is_admin_or_above());
