/**
 * NetGrowth — TypeScript database types and domain models.
 * Structured for direct compatibility with Supabase PostgreSQL schema.
 */

export type LeadStatus =
  | 'new'
  | 'qualified'
  | 'contacted'
  | 'meeting_scheduled'
  | 'proposal_sent'
  | 'won'
  | 'lost';

export type LeadClassification = 'hot' | 'warm' | 'cold';

export type ActivityType =
  | 'lead_created'
  | 'lead_updated'
  | 'ai_analyzed'
  | 'score_updated'
  | 'email_generated'
  | 'email_sent'
  | 'sales_alert'
  | 'follow_up_scheduled'
  | 'follow_up_completed'
  | 'status_changed';

export type FollowUpStatus = 'scheduled' | 'completed' | 'cancelled' | 'overdue';

export type FollowUpChannel = 'email' | 'phone' | 'whatsapp' | 'sms' | 'meeting';
export type OrganizationRole = 'admin' | 'sales';

export interface Profile {
  id: string;
  organization_id: string | null;
  role?: OrganizationRole;
  email: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  organization_id: string;
  assigned_to: string | null;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  company_name: string | null;
  job_title: string | null;
  website: string | null;
  industry: string | null;
  inquiry: string;
  budget: number | null;
  budget_currency: string;
  timeline: string | null;
  source: string | null;
  status: LeadStatus;
  score: number | null;
  classification: LeadClassification | null;
  ai_summary: string | null;
  ai_pain_points: string[] | Record<string, unknown> | null;
  ai_buying_signals: string[] | Record<string, unknown> | null;
  ai_recommended_action: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  type: ActivityType | string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  scheduled_for: string;
  status: FollowUpStatus;
  channel: FollowUpChannel;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  // Optional join fields
  lead?: {
    first_name: string;
    last_name: string | null;
    company_name: string | null;
    email: string;
  };
}

export interface DashboardMetrics {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  newLeads: number;
  averageScore: number | null;
}

export interface CreateLeadInput {
  assigned_to?: string | null;
  first_name: string;
  last_name?: string | null;
  email: string;
  phone?: string | null;
  company_name?: string | null;
  job_title?: string | null;
  website?: string | null;
  industry?: string | null;
  inquiry: string;
  budget?: number | null;
  budget_currency?: string;
  timeline?: string | null;
  source?: string | null;
  status?: LeadStatus;
  score?: number | null;
  classification?: LeadClassification | null;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  assigned_to?: string | null;
  ai_summary?: string | null;
  ai_pain_points?: string[] | Record<string, unknown> | null;
  ai_buying_signals?: string[] | Record<string, unknown> | null;
  ai_recommended_action?: string | null;
}

export interface CreateFollowUpInput {
  lead_id: string;
  scheduled_for: string;
  channel: FollowUpChannel;
  notes?: string | null;
  status?: FollowUpStatus;
}
