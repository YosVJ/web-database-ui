-- =========================================================
-- Synercore Web Database UI
-- Security Hardening Migration
-- Date: 2026-04-20
-- Scope:
--   - profiles
--   - user_companies
--   - purchase_requests
-- Notes:
--   - No companies table yet; company_id remains text-based
--   - Frontend uses Supabase publishable key only
--   - RLS is the real tenant boundary
-- =========================================================

begin;

-- ---------------------------------------------------------
-- 1) Align schema with current frontend usage
-- ---------------------------------------------------------

-- Auth.jsx currently upserts email and provider into profiles.
alter table public.profiles
  add column if not exists email text,
  add column if not exists provider text;

-- Keep sane defaults where appropriate.
alter table public.profiles
  alter column role set default 'user',
  alter column language set default 'en';

-- Ensure created_at has a default if missing behavior-wise.
alter table public.profiles
  alter column created_at set default now();

alter table public.purchase_requests
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.user_companies
  alter column created_at set default now(),
  alter column updated_at set default now();

-- ---------------------------------------------------------
-- 2) Optional but recommended indexes
-- ---------------------------------------------------------

create index if not exists idx_profiles_role
  on public.profiles(role);

create index if not exists idx_user_companies_user_id
  on public.user_companies(user_id);

create index if not exists idx_user_companies_company_id
  on public.user_companies(company_id);

create index if not exists idx_purchase_requests_company_id
  on public.purchase_requests(company_id);

create index if not exists idx_purchase_requests_created_by
  on public.purchase_requests(created_by);

create index if not exists idx_purchase_requests_created_at
  on public.purchase_requests(created_at);

-- ---------------------------------------------------------
-- 3) Enable Row Level Security
-- ---------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_companies enable row level security;
alter table public.purchase_requests enable row level security;

-- ---------------------------------------------------------
-- 4) Helper authorization functions
-- ---------------------------------------------------------

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'super_admin'
  );
$$;

create or replace function public.user_has_company_access(target_company_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or exists (
      select 1
      from public.user_companies uc
      where uc.user_id = auth.uid()
        and uc.company_id = target_company_id
    );
$$;

revoke all on function public.is_super_admin() from public;
revoke all on function public.user_has_company_access(text) from public;

grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.user_has_company_access(text) to authenticated;

-- ---------------------------------------------------------
-- 5) Cleanup old policies if they exist
-- ---------------------------------------------------------

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_super_admin_only" on public.profiles;

drop policy if exists "user_companies_select_own_or_super_admin" on public.user_companies;
drop policy if exists "user_companies_modify_super_admin_only" on public.user_companies;

drop policy if exists "purchase_requests_select_member_companies" on public.purchase_requests;
drop policy if exists "purchase_requests_insert_member_companies" on public.purchase_requests;
drop policy if exists "purchase_requests_update_member_companies" on public.purchase_requests;
drop policy if exists "purchase_requests_delete_admin_only" on public.purchase_requests;

-- ---------------------------------------------------------
-- 6) profiles policies
-- ---------------------------------------------------------

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_super_admin()
);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or public.is_super_admin()
)
with check (
  (
    id = auth.uid()
    and role = (
      select p.role
      from public.profiles p
      where p.id = auth.uid()
    )
  )
  or public.is_super_admin()
);

create policy "profiles_delete_super_admin_only"
on public.profiles
for delete
to authenticated
using (
  public.is_super_admin()
);

-- ---------------------------------------------------------
-- 7) user_companies policies
-- ---------------------------------------------------------

create policy "user_companies_select_own_or_super_admin"
on public.user_companies
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_super_admin()
);

create policy "user_companies_modify_super_admin_only"
on public.user_companies
for all
to authenticated
using (
  public.is_super_admin()
)
with check (
  public.is_super_admin()
);

-- ---------------------------------------------------------
-- 8) purchase_requests policies
-- ---------------------------------------------------------

create policy "purchase_requests_select_member_companies"
on public.purchase_requests
for select
to authenticated
using (
  public.user_has_company_access(company_id)
);

create policy "purchase_requests_insert_member_companies"
on public.purchase_requests
for insert
to authenticated
with check (
  public.user_has_company_access(company_id)
  and created_by = auth.uid()
);

create policy "purchase_requests_update_member_companies"
on public.purchase_requests
for update
to authenticated
using (
  public.user_has_company_access(company_id)
)
with check (
  public.user_has_company_access(company_id)
);

create policy "purchase_requests_delete_admin_only"
on public.purchase_requests
for delete
to authenticated
using (
  public.is_super_admin()
);

-- ---------------------------------------------------------
-- 9) Trigger: protect role escalation in profiles
-- ---------------------------------------------------------

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_super_admin() then
    raise exception 'Not allowed to change role';
  end if;

  if old.id is distinct from new.id then
    raise exception 'Cannot change profile id';
  end if;

  new.created_at := coalesce(old.created_at, new.created_at, now());
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_role on public.profiles;

create trigger trg_protect_profile_role
before update on public.profiles
for each row
execute function public.protect_profile_role();

-- ---------------------------------------------------------
-- 10) Trigger: auto-update updated_at
-- ---------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_purchase_requests_updated_at on public.purchase_requests;
create trigger trg_purchase_requests_updated_at
before update on public.purchase_requests
for each row
execute function public.set_updated_at();

drop trigger if exists trg_user_companies_updated_at on public.user_companies;
create trigger trg_user_companies_updated_at
before update on public.user_companies
for each row
execute function public.set_updated_at();

commit;