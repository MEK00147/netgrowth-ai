-- NetGrowth initial schema: single business-owner workspace.
-- Apply through the Supabase CLI or SQL Editor before adding VITE_SUPABASE_* values.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  full_name text,
  company_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null check (length(trim(first_name)) between 1 and 100),
  last_name text check (last_name is null or length(trim(last_name)) <= 100),
  email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text check (phone is null or length(trim(phone)) between 7 and 32),
  company_name text check (company_name is null or length(trim(company_name)) <= 160),
  job_title text check (job_title is null or length(trim(job_title)) <= 120),
  website text check (website is null or length(trim(website)) <= 2048),
  industry text check (industry is null or length(trim(industry)) <= 100),
  inquiry text not null check (length(trim(inquiry)) between 1 and 10000),
  budget numeric(14, 2) check (budget is null or budget >= 0),
  budget_currency char(3) not null default 'NGN' check (budget_currency ~ '^[A-Z]{3}$'),
  timeline text check (timeline is null or length(trim(timeline)) <= 100),
  source text check (source is null or length(trim(source)) <= 100),
  status text not null default 'new' check (status in ('new', 'qualified', 'contacted', 'meeting_scheduled', 'proposal_sent', 'won', 'lost')),
  score integer check (score is null or score between 0 and 100),
  classification text check (classification is null or classification in ('hot', 'warm', 'cold')),
  ai_summary text,
  ai_pain_points jsonb,
  ai_buying_signals jsonb,
  ai_recommended_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null check (length(trim(type)) between 1 and 80),
  description text not null check (length(trim(description)) between 1 and 2000),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  scheduled_for timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'overdue')),
  channel text not null check (channel in ('email', 'phone', 'whatsapp', 'sms', 'meeting')),
  notes text check (notes is null or length(notes) <= 5000),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists leads_owner_created_at_idx on public.leads (owner_id, created_at desc);
create index if not exists leads_owner_status_idx on public.leads (owner_id, status);
create index if not exists leads_owner_classification_idx on public.leads (owner_id, classification);
create index if not exists activities_lead_created_at_idx on public.activities (lead_id, created_at desc);
create index if not exists follow_ups_lead_scheduled_for_idx on public.follow_ups (lead_id, scheduled_for asc);

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.activities enable row level security;
alter table public.follow_ups enable row level security;

-- Anonymous visitors have no direct access to business data.
revoke all on schema public from public, anon;
revoke all on table public.profiles, public.leads, public.activities, public.follow_ups from public, anon;
revoke all on table public.profiles, public.leads, public.activities, public.follow_ups from authenticated;
grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, company_name, avatar_url) on public.profiles to authenticated;
grant select, insert, update, delete on public.leads to authenticated;
grant select, insert on public.activities to authenticated;
grant select, insert, update, delete on public.follow_ups to authenticated;

create policy "profiles: owner reads own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "profiles: owner updates own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "leads: owner reads own leads"
  on public.leads for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy "leads: owner creates own leads"
  on public.leads for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy "leads: owner updates own leads"
  on public.leads for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "leads: owner deletes own leads"
  on public.leads for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy "activities: lead owner reads activities"
  on public.activities for select to authenticated
  using (exists (select 1 from public.leads where leads.id = activities.lead_id and leads.owner_id = (select auth.uid())));
create policy "activities: lead owner creates activities"
  on public.activities for insert to authenticated
  with check (exists (select 1 from public.leads where leads.id = activities.lead_id and leads.owner_id = (select auth.uid())));

create policy "follow ups: lead owner reads follow ups"
  on public.follow_ups for select to authenticated
  using (exists (select 1 from public.leads where leads.id = follow_ups.lead_id and leads.owner_id = (select auth.uid())));
create policy "follow ups: lead owner creates follow ups"
  on public.follow_ups for insert to authenticated
  with check (exists (select 1 from public.leads where leads.id = follow_ups.lead_id and leads.owner_id = (select auth.uid())));
create policy "follow ups: lead owner updates follow ups"
  on public.follow_ups for update to authenticated
  using (exists (select 1 from public.leads where leads.id = follow_ups.lead_id and leads.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.leads where leads.id = follow_ups.lead_id and leads.owner_id = (select auth.uid())));
create policy "follow ups: lead owner deletes follow ups"
  on public.follow_ups for delete to authenticated
  using (exists (select 1 from public.leads where leads.id = follow_ups.lead_id and leads.owner_id = (select auth.uid())));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles as profile (id, email, full_name, company_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'company_name', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profile.full_name),
    company_name = coalesce(excluded.company_name, profile.company_name),
    updated_at = now();
  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();
