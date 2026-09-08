-- NetGrowth organization-scoped schema with backend-enforced admin/sales access.
create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(), name text not null check (length(trim(name)) between 1 and 160),
  created_by uuid not null references auth.users(id) on delete restrict, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'sales' check (role in ('admin', 'sales')), created_at timestamptz not null default now(), primary key (organization_id, user_id)
);
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade, organization_id uuid references public.organizations(id) on delete set null,
  email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'), full_name text, company_name text, avatar_url text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  assigned_to uuid references auth.users(id) on delete set null, first_name text not null check (length(trim(first_name)) between 1 and 100),
  last_name text check (last_name is null or length(trim(last_name)) <= 100), email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text check (phone is null or length(trim(phone)) between 7 and 32), company_name text check (company_name is null or length(trim(company_name)) <= 160),
  job_title text check (job_title is null or length(trim(job_title)) <= 120), website text check (website is null or length(trim(website)) <= 2048),
  industry text check (industry is null or length(trim(industry)) <= 100), inquiry text not null check (length(trim(inquiry)) between 1 and 10000),
  budget numeric(14, 2) check (budget is null or budget >= 0), budget_currency char(3) not null default 'NGN' check (budget_currency ~ '^[A-Z]{3}$'),
  timeline text, source text, status text not null default 'new' check (status in ('new', 'qualified', 'contacted', 'meeting_scheduled', 'proposal_sent', 'won', 'lost')),
  score integer check (score is null or score between 0 and 100), classification text check (classification is null or classification in ('hot', 'warm', 'cold')),
  ai_summary text, ai_pain_points jsonb, ai_buying_signals jsonb, ai_recommended_action text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.activities (id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.leads(id) on delete cascade, type text not null, description text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.follow_ups (id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.leads(id) on delete cascade, scheduled_for timestamptz not null, status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'overdue')), channel text not null check (channel in ('email', 'phone', 'whatsapp', 'sms', 'meeting')), notes text, created_at timestamptz not null default now(), completed_at timestamptz);
create index if not exists leads_org_created_at_idx on public.leads (organization_id, created_at desc);
create index if not exists leads_org_assigned_idx on public.leads (organization_id, assigned_to);
create index if not exists activities_lead_created_at_idx on public.activities (lead_id, created_at desc);
create index if not exists follow_ups_lead_scheduled_for_idx on public.follow_ups (lead_id, scheduled_for asc);

create or replace function public.is_org_member(target_org uuid, required_role text default null) returns boolean language sql stable security definer set search_path = '' as $$ select exists (select 1 from public.organization_members m where m.organization_id = target_org and m.user_id = (select auth.uid()) and (required_role is null or m.role = required_role)); $$;
alter table public.organizations enable row level security; alter table public.organization_members enable row level security; alter table public.profiles enable row level security; alter table public.leads enable row level security; alter table public.activities enable row level security; alter table public.follow_ups enable row level security;
revoke all on schema public from public, anon; revoke all on all tables in schema public from public, anon, authenticated; grant usage on schema public to authenticated;
grant select on public.organizations, public.organization_members, public.profiles to authenticated; grant update (full_name, company_name, avatar_url) on public.profiles to authenticated; grant select, insert, update, delete on public.leads to authenticated; grant select, insert on public.activities to authenticated; grant select, insert, update, delete on public.follow_ups to authenticated;

create policy "members read organizations" on public.organizations for select to authenticated using (public.is_org_member(id));
create policy "members read membership" on public.organization_members for select to authenticated using (public.is_org_member(organization_id));
create policy "admins manage membership" on public.organization_members for all to authenticated using (public.is_org_member(organization_id, 'admin')) with check (public.is_org_member(organization_id, 'admin'));
create policy "users read profiles" on public.profiles for select to authenticated using ((select auth.uid()) = id or public.is_org_member(organization_id));
create policy "users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "admins manage all leads" on public.leads for all to authenticated using (public.is_org_member(organization_id, 'admin')) with check (public.is_org_member(organization_id, 'admin'));
create policy "sales read assigned leads" on public.leads for select to authenticated using (public.is_org_member(organization_id, 'sales') and assigned_to = (select auth.uid()));
create policy "sales update assigned leads" on public.leads for update to authenticated using (public.is_org_member(organization_id, 'sales') and assigned_to = (select auth.uid())) with check (public.is_org_member(organization_id, 'sales') and assigned_to = (select auth.uid()));
create policy "members read activities" on public.activities for select to authenticated using (exists (select 1 from public.leads l where l.id = lead_id and (public.is_org_member(l.organization_id, 'admin') or (public.is_org_member(l.organization_id, 'sales') and l.assigned_to = (select auth.uid())))));
create policy "members add activities" on public.activities for insert to authenticated with check (exists (select 1 from public.leads l where l.id = lead_id and (public.is_org_member(l.organization_id, 'admin') or (public.is_org_member(l.organization_id, 'sales') and l.assigned_to = (select auth.uid())))));
create policy "members manage followups" on public.follow_ups for all to authenticated using (exists (select 1 from public.leads l where l.id = lead_id and (public.is_org_member(l.organization_id, 'admin') or (public.is_org_member(l.organization_id, 'sales') and l.assigned_to = (select auth.uid()))))) with check (exists (select 1 from public.leads l where l.id = lead_id and (public.is_org_member(l.organization_id, 'admin') or (public.is_org_member(l.organization_id, 'sales') and l.assigned_to = (select auth.uid())))));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$ declare new_org uuid; begin insert into public.organizations (name, created_by) values (coalesce(nullif(new.raw_user_meta_data ->> 'company_name', ''), 'My Organization'), new.id) returning id into new_org; insert into public.organization_members (organization_id, user_id, role) values (new_org, new.id, 'admin'); insert into public.profiles (id, organization_id, email, full_name, company_name) values (new.id, new_org, new.email, nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'company_name', '')) on conflict (id) do update set email = excluded.email, organization_id = coalesce(public.profiles.organization_id, excluded.organization_id), updated_at = now(); return new; end; $$;
create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated; revoke execute on function public.set_updated_at() from public, anon, authenticated; revoke execute on function public.is_org_member(uuid, text) from public, anon; grant execute on function public.is_org_member(uuid, text) to authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_leads_updated_at before update on public.leads for each row execute function public.set_updated_at();
