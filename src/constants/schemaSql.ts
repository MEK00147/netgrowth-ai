export const MULTI_TENANT_SCHEMA_SQL = `-- ==============================================================================
-- NetGrowth / LeadFlow AI: Organization-Based Access Control & Manual Lead Assignment
-- PostgreSQL & Supabase Database Migration (Production-Ready)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE
-- Stores user identity data linked 1:1 with auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ORGANIZATIONS TABLE
-- Multi-tenant workspace entities
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. ORGANIZATION_MEMBERS TABLE
-- Assigns users to organizations with explicit roles ('admin' or 'sales')
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sales')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (organization_id, user_id)
);

-- 5. LEADS TABLE
-- Organization-owned sales leads with manual salesperson assignment
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  service_interest TEXT,
  job_title TEXT,
  website TEXT,
  industry TEXT,
  inquiry TEXT NOT NULL,
  budget NUMERIC,
  budget_currency TEXT NOT NULL DEFAULT 'NGN',
  timeline TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new' 
    CHECK (status IN ('new', 'qualified', 'contacted', 'meeting_scheduled', 'proposal_sent', 'won', 'lost')),
  score INTEGER 
    CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  ai_score INTEGER 
    CHECK (ai_score IS NULL OR (ai_score >= 0 AND ai_score <= 100)),
  classification TEXT 
    CHECK (classification IS NULL OR classification IN ('hot', 'warm', 'cold')),
  temperature TEXT 
    CHECK (temperature IS NULL OR temperature IN ('hot', 'warm', 'cold')),
  ai_summary TEXT,
  ai_pain_points JSONB,
  ai_buying_signals JSONB,
  ai_recommended_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Safely add multi-tenant columns in case public.leads was previously created with an older schema
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS service_interest TEXT,
  ADD COLUMN IF NOT EXISTS timeline TEXT,
  ADD COLUMN IF NOT EXISTS ai_score INTEGER,
  ADD COLUMN IF NOT EXISTS temperature TEXT,
  ADD COLUMN IF NOT EXISTS ai_pain_points JSONB,
  ADD COLUMN IF NOT EXISTS ai_buying_signals JSONB,
  ADD COLUMN IF NOT EXISTS ai_recommended_action TEXT,
  ADD COLUMN IF NOT EXISTS tags JSONB,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS buying_intent TEXT,
  ADD COLUMN IF NOT EXISTS recommended_action TEXT;

-- 6. ACTIVITIES TABLE
-- Comprehensive audit trail for leads, assignment events, and notes
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  activity_type TEXT,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS activity_type TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 7. FOLLOW_UPS TABLE
-- Scheduled tasks and communication touchpoints
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'overdue')),
  channel TEXT NOT NULL
    CHECK (channel IN ('email', 'phone', 'whatsapp', 'sms', 'meeting')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ
);

-- 8. INDEXES FOR HIGH-PERFORMANCE MULTI-TENANT QUERYING
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON public.organization_members(role);

CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_classification ON public.leads(classification);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_org_id ON public.activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);

CREATE INDEX IF NOT EXISTS idx_follow_ups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled_for ON public.follow_ups(scheduled_for ASC);

-- 9. SECURITY DEFINER HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_auth_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
  SELECT role
  FROM public.organization_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
CREATE POLICY "Users can view profiles in their organization"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR id IN (
      SELECT om.user_id
      FROM public.organization_members om
      WHERE om.organization_id = public.get_auth_user_organization_id()
    )
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ORGANIZATIONS POLICIES
DROP POLICY IF EXISTS "Members can view their own organization" ON public.organizations;
CREATE POLICY "Members can view their own organization"
  ON public.organizations FOR SELECT
  USING (
    id = public.get_auth_user_organization_id()
  );

-- ORGANIZATION_MEMBERS POLICIES
DROP POLICY IF EXISTS "Members can view members of their organization" ON public.organization_members;
CREATE POLICY "Members can view members of their organization"
  ON public.organization_members FOR SELECT
  USING (
    organization_id = public.get_auth_user_organization_id()
  );

DROP POLICY IF EXISTS "Admins can manage organization members" ON public.organization_members;
CREATE POLICY "Admins can manage organization members"
  ON public.organization_members FOR ALL
  USING (
    public.is_org_admin() = true
    AND organization_id = public.get_auth_user_organization_id()
  )
  WITH CHECK (
    public.is_org_admin() = true
    AND organization_id = public.get_auth_user_organization_id()
  );

-- LEADS POLICIES: MULTI-TENANT & ROLE-BASED ISOLATION
-- 1. Admins see ALL leads in their organization.
-- 2. Sales users see ONLY leads assigned to their authenticated user ID in their organization.
DROP POLICY IF EXISTS "Role-based leads view policy" ON public.leads;
CREATE POLICY "Role-based leads view policy"
  ON public.leads FOR SELECT
  USING (
    organization_id = public.get_auth_user_organization_id()
    AND (
      public.is_org_admin() = true
      OR assigned_to = auth.uid()
    )
  );

-- Admins can create leads for their organization.
DROP POLICY IF EXISTS "Admins can create leads" ON public.leads;
CREATE POLICY "Admins can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (
    public.is_org_admin() = true
    AND organization_id = public.get_auth_user_organization_id()
  );

-- Admins can update any field and assign/reassign leads within their organization.
DROP POLICY IF EXISTS "Admins can update all organization leads" ON public.leads;
CREATE POLICY "Admins can update all organization leads"
  ON public.leads FOR UPDATE
  USING (
    public.is_org_admin() = true
    AND organization_id = public.get_auth_user_organization_id()
  )
  WITH CHECK (
    public.is_org_admin() = true
    AND organization_id = public.get_auth_user_organization_id()
  );

-- Sales users can update ONLY leads assigned to them.
-- Sales users CANNOT change assigned_to or organization_id (enforced in WITH CHECK).
DROP POLICY IF EXISTS "Sales users can update only their assigned leads" ON public.leads;
CREATE POLICY "Sales users can update only their assigned leads"
  ON public.leads FOR UPDATE
  USING (
    public.get_auth_user_role() = 'sales'
    AND organization_id = public.get_auth_user_organization_id()
    AND assigned_to = auth.uid()
  )
  WITH CHECK (
    public.get_auth_user_role() = 'sales'
    AND organization_id = public.get_auth_user_organization_id()
    AND assigned_to = auth.uid()
  );

-- Only Admins can delete leads belonging to their organization.
DROP POLICY IF EXISTS "Admins can delete organization leads" ON public.leads;
CREATE POLICY "Admins can delete organization leads"
  ON public.leads FOR DELETE
  USING (
    public.is_org_admin() = true
    AND organization_id = public.get_auth_user_organization_id()
  );

-- ACTIVITIES POLICIES
DROP POLICY IF EXISTS "Users can view activities for accessible leads" ON public.activities;
CREATE POLICY "Users can view activities for accessible leads"
  ON public.activities FOR SELECT
  USING (
    organization_id = public.get_auth_user_organization_id()
    AND (
      public.is_org_admin() = true
      OR EXISTS (
        SELECT 1 FROM public.leads
        WHERE leads.id = activities.lead_id
          AND leads.assigned_to = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create activities for accessible leads" ON public.activities;
CREATE POLICY "Users can create activities for accessible leads"
  ON public.activities FOR INSERT
  WITH CHECK (
    organization_id = public.get_auth_user_organization_id()
    AND (
      public.is_org_admin() = true
      OR EXISTS (
        SELECT 1 FROM public.leads
        WHERE leads.id = activities.lead_id
          AND leads.assigned_to = auth.uid()
      )
    )
  );

-- FOLLOW_UPS POLICIES
DROP POLICY IF EXISTS "Users can access follow-ups for accessible leads" ON public.follow_ups;
CREATE POLICY "Users can access follow-ups for accessible leads"
  ON public.follow_ups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = follow_ups.lead_id
        AND leads.organization_id = public.get_auth_user_organization_id()
        AND (
          public.is_org_admin() = true
          OR leads.assigned_to = auth.uid()
        )
    )
  );

-- 11. AUTOMATIC PROFILE AND ORGANIZATION CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user_org_setup()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_full_name TEXT;
  user_company TEXT;
BEGIN
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Executive');
  user_company := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Primary Workspace');

  INSERT INTO public.profiles (id, email, full_name, company_name)
  VALUES (NEW.id, NEW.email, user_full_name, user_company)
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;

  IF NOT EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = NEW.id) THEN
    INSERT INTO public.organizations (name)
    VALUES (user_company)
    RETURNING id INTO new_org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, NEW.id, 'admin');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_org ON auth.users;
CREATE TRIGGER on_auth_user_created_org
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_org_setup();

-- 12. PERMISSIONS & ROLE PRIVILEGES
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- 13. IDEMPOTENT BACKFILL: INITIALIZE ORGANIZATIONS FOR EXISTING USERS & LEADS
DO $$
DECLARE
  p RECORD;
  new_org_id UUID;
BEGIN
  -- Backfill any existing users who do not have an organization membership yet
  FOR p IN 
    SELECT * FROM public.profiles 
    WHERE id NOT IN (SELECT user_id FROM public.organization_members)
  LOOP
    INSERT INTO public.organizations (name)
    VALUES (COALESCE(p.company_name, 'Primary Workspace'))
    RETURNING id INTO new_org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, p.id, 'admin');

    -- Link any existing leads owned by this profile to the new organization
    UPDATE public.leads 
    SET organization_id = new_org_id,
        created_by = COALESCE(created_by, p.id),
        owner_id = COALESCE(owner_id, p.id)
    WHERE organization_id IS NULL AND (owner_id = p.id OR created_by = p.id OR owner_id IS NULL);
  END LOOP;
END;
$$;
`;
