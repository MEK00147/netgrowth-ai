import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Copy, Check, Database, ShieldCheck, KeyRound } from 'lucide-react';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- ==============================================================================
-- LeadFlow AI: Phase 1 Production-Ready PostgreSQL & Supabase Database Migration
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. LEADS TABLE (Core business entity with AI readiness)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
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
  classification TEXT 
    CHECK (classification IS NULL OR classification IN ('hot', 'warm', 'cold')),
  ai_summary TEXT,
  ai_pain_points JSONB,
  ai_buying_signals JSONB,
  ai_recommended_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. ACTIVITIES TABLE (Audit trail & future automation logs)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. FOLLOW_UPS TABLE (Scheduled touchpoints)
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

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON public.leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_classification ON public.leads(classification);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follow_ups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled_for ON public.follow_ups(scheduled_for ASC);

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Leads Policies
CREATE POLICY "Users can view their own leads" ON public.leads FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create leads assigned to themselves" ON public.leads FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own leads" ON public.leads FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own leads" ON public.leads FOR DELETE USING (auth.uid() = owner_id);

-- Activities Policies
CREATE POLICY "Users can view activities for their own leads" ON public.activities FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = activities.lead_id AND leads.owner_id = auth.uid()));
CREATE POLICY "Users can create activities for their own leads" ON public.activities FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = activities.lead_id AND leads.owner_id = auth.uid()));

-- Follow_ups Policies
CREATE POLICY "Users can view follow-ups for their own leads" ON public.follow_ups FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = follow_ups.lead_id AND leads.owner_id = auth.uid()));
CREATE POLICY "Users can insert follow-ups for their own leads" ON public.follow_ups FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = follow_ups.lead_id AND leads.owner_id = auth.uid()));
CREATE POLICY "Users can update follow-ups for their own leads" ON public.follow_ups FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = follow_ups.lead_id AND leads.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = follow_ups.lead_id AND leads.owner_id = auth.uid()));
CREATE POLICY "Users can delete follow-ups for their own leads" ON public.follow_ups FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = follow_ups.lead_id AND leads.owner_id = auth.uid()));

-- 8. AUTH TRIGGER (Auto profile on signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    company_name = COALESCE(NULLIF(EXCLUDED.company_name, ''), profiles.company_name),
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PostgreSQL Schema & Security Architecture"
      description="Production schema, Row Level Security (RLS) policies, indexes, and triggers ready for Supabase."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Environment setup instructions */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-700 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>Environment Variable Configuration</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Configure your Supabase credentials in your project <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">.env</code>:
          </p>
          <div className="bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-[11px] select-all">
            VITE_SUPABASE_URL=https://your-project.supabase.co<br />
            VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-medium pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Never expose service-role keys. Client-side queries are enforced by PostgreSQL RLS.</span>
          </div>
        </div>

        {/* SQL Preview Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>supabase/schema.sql</span>
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={copyToClipboard}
            >
              <span>{copied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
            </Button>
          </div>
          <div className="relative">
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto max-h-72 border border-slate-800">
              <code>{sqlSchema}</code>
            </pre>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
