import { Lead, Activity, FollowUp, Profile } from '../types/database';

export const DEMO_USER_PROFILE: Profile = {
  id: 'demo-user-00000000-0000-0000-0000-000000000001',
  organization_id: 'demo-org-00000000-0000-0000-000000000001',
  role: 'admin',
  email: 'alex.director@acmecorp.com',
  full_name: 'Alex Rivera',
  company_name: 'Apex Growth Dynamics',
  avatar_url: null,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const INITIAL_DEMO_LEADS: Lead[] = [
  {
    id: 'demo-lead-101',
    organization_id: DEMO_USER_PROFILE.organization_id!, assigned_to: DEMO_USER_PROFILE.id,
    first_name: 'Chidi',
    last_name: 'Okonkwo',
    email: 'chidi.okonkwo@lagosfintech.ng',
    phone: '+234 803 123 4567',
    company_name: 'Lagos Fintech Solutions',
    job_title: 'Chief Technology Officer',
    website: 'https://lagosfintech.ng',
    industry: 'Financial Technology',
    inquiry: 'Looking for enterprise AI qualification to triage over 800 inbound merchant loan applications per week. High urgency to integrate by next quarter.',
    budget: 8500000,
    budget_currency: 'NGN',
    timeline: 'Within 30 days',
    source: 'Website Contact Form',
    status: 'qualified',
    score: 92,
    classification: 'hot',
    ai_summary: null, // Phase 1: AI analysis pending
    ai_pain_points: null,
    ai_buying_signals: null,
    ai_recommended_action: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'demo-lead-102',
    organization_id: DEMO_USER_PROFILE.organization_id!, assigned_to: DEMO_USER_PROFILE.id,
    first_name: 'Fatima',
    last_name: 'Bello',
    email: 'fatima@sahara-logistics.com',
    phone: '+234 812 987 6543',
    company_name: 'Sahara Cold-Chain Logistics',
    job_title: 'VP of Commercial Operations',
    website: 'https://sahara-logistics.com',
    industry: 'Logistics & Supply Chain',
    inquiry: 'We need automated inbound lead intake across 5 distribution hubs in West Africa. Exploring options for automated qualification.',
    budget: 4500000,
    budget_currency: 'NGN',
    timeline: '1-3 months',
    source: 'LinkedIn Sponsored Campaign',
    status: 'meeting_scheduled',
    score: 74,
    classification: 'warm',
    ai_summary: null,
    ai_pain_points: null,
    ai_buying_signals: null,
    ai_recommended_action: null,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'demo-lead-103',
    organization_id: DEMO_USER_PROFILE.organization_id!, assigned_to: DEMO_USER_PROFILE.id,
    first_name: 'David',
    last_name: 'Adeyemi',
    email: 'david@greenfieldagri.co',
    phone: '+234 705 555 0192',
    company_name: 'Greenfield Agri Export',
    job_title: 'Managing Director',
    website: 'https://greenfieldagri.co',
    industry: 'Agriculture & Commodities',
    inquiry: 'Evaluating CRM and sales automation tools. Just asking for standard pricing and features sheet.',
    budget: 800000,
    budget_currency: 'NGN',
    timeline: 'More than 3 months',
    source: 'Organic Search',
    status: 'new',
    score: 38,
    classification: 'cold',
    ai_summary: null,
    ai_pain_points: null,
    ai_buying_signals: null,
    ai_recommended_action: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'demo-lead-104',
    organization_id: DEMO_USER_PROFILE.organization_id!, assigned_to: DEMO_USER_PROFILE.id,
    first_name: 'Zainab',
    last_name: 'Ibrahim',
    email: 'z.ibrahim@pulsehealth.io',
    phone: '+234 809 333 4444',
    company_name: 'PulseHealth Africa',
    job_title: 'Head of Growth',
    website: 'https://pulsehealth.io',
    industry: 'Healthcare Technology',
    inquiry: 'Interested in automating our demo booking requests and qualifying clinical laboratory leads.',
    budget: 6000000,
    budget_currency: 'NGN',
    timeline: 'Within 30 days',
    source: 'Referral',
    status: 'proposal_sent',
    score: 88,
    classification: 'hot',
    ai_summary: null,
    ai_pain_points: null,
    ai_buying_signals: null,
    ai_recommended_action: null,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'demo-lead-105',
    organization_id: DEMO_USER_PROFILE.organization_id!, assigned_to: DEMO_USER_PROFILE.id,
    first_name: 'Emeka',
    last_name: 'Nnamdi',
    email: 'emeka@strata-proptech.com',
    phone: '+234 802 777 8899',
    company_name: 'Strata PropTech',
    job_title: 'Sales Operations Lead',
    website: 'https://strata-proptech.com',
    industry: 'Real Estate & Property',
    inquiry: 'Inbound buyer leads require swift initial contact. Want to explore the system capabilities for property agents.',
    budget: 2500000,
    budget_currency: 'NGN',
    timeline: '1-3 months',
    source: 'Website Contact Form',
    status: 'contacted',
    score: 65,
    classification: 'warm',
    ai_summary: null,
    ai_pain_points: null,
    ai_buying_signals: null,
    ai_recommended_action: null,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  }
];

export const INITIAL_DEMO_ACTIVITIES: Activity[] = [
  {
    id: 'demo-act-1',
    lead_id: 'demo-lead-101',
    type: 'lead_created',
    description: 'Inbound lead received via Website Contact Form',
    metadata: { source: 'Website Contact Form', ip_region: 'Lagos, NG' },
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'demo-act-2',
    lead_id: 'demo-lead-101',
    type: 'status_changed',
    description: 'Status updated from "new" to "qualified"',
    metadata: { previous_status: 'new', new_status: 'qualified' },
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'demo-act-3',
    lead_id: 'demo-lead-102',
    type: 'lead_created',
    description: 'Lead captured through LinkedIn Sponsored Campaign',
    metadata: { campaign: 'enterprise_h1' },
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'demo-act-4',
    lead_id: 'demo-lead-102',
    type: 'follow_up_scheduled',
    description: 'Discovery call meeting scheduled with VP of Commercial Operations',
    metadata: { channel: 'meeting' },
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'demo-act-5',
    lead_id: 'demo-lead-104',
    type: 'lead_created',
    description: 'Inbound referral from existing client partner',
    metadata: { partner: 'Apex Med' },
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

export const INITIAL_DEMO_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'demo-fup-1',
    lead_id: 'demo-lead-101',
    scheduled_for: new Date(Date.now() + 1 * 86400000).toISOString(),
    status: 'scheduled',
    channel: 'meeting',
    notes: 'Technical architecture alignment call with Chidi and senior dev team',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    completed_at: null,
    lead: {
      first_name: 'Chidi',
      last_name: 'Okonkwo',
      company_name: 'Lagos Fintech Solutions',
      email: 'chidi.okonkwo@lagosfintech.ng',
    }
  },
  {
    id: 'demo-fup-2',
    lead_id: 'demo-lead-102',
    scheduled_for: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: 'scheduled',
    channel: 'phone',
    notes: 'Confirm regional deployment scope across 5 distribution hubs',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed_at: null,
    lead: {
      first_name: 'Fatima',
      last_name: 'Bello',
      company_name: 'Sahara Cold-Chain Logistics',
      email: 'fatima@sahara-logistics.com',
    }
  },
  {
    id: 'demo-fup-3',
    lead_id: 'demo-lead-104',
    scheduled_for: new Date(Date.now() + 3 * 86400000).toISOString(),
    status: 'scheduled',
    channel: 'email',
    notes: 'Follow-up on enterprise SLA proposal sent yesterday',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    completed_at: null,
    lead: {
      first_name: 'Zainab',
      last_name: 'Ibrahim',
      company_name: 'PulseHealth Africa',
      email: 'z.ibrahim@pulsehealth.io',
    }
  }
];

// In-memory demo state with local storage synchronization for seamless preview interaction
const DEMO_STORAGE_KEY = 'netgrowth_demo_state_v1';

interface DemoStoreState {
  leads: Lead[];
  activities: Activity[];
  followUps: FollowUp[];
  profile: Profile;
}

const loadDemoState = (): DemoStoreState => {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read demo state from localStorage', e);
  }
  return {
    leads: INITIAL_DEMO_LEADS,
    activities: INITIAL_DEMO_ACTIVITIES,
    followUps: INITIAL_DEMO_FOLLOW_UPS,
    profile: DEMO_USER_PROFILE,
  };
};

let currentDemoState: DemoStoreState = loadDemoState();

const saveDemoState = () => {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(currentDemoState));
  } catch (e) {
    console.warn('Could not save demo state to localStorage', e);
  }
};

export const demoStore = {
  getProfile: (): Profile => ({ ...currentDemoState.profile }),
  updateProfile: (updates: Partial<Profile>): Profile => {
    currentDemoState.profile = {
      ...currentDemoState.profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveDemoState();
    return { ...currentDemoState.profile };
  },
  getLeads: (): Lead[] => [...currentDemoState.leads],
  getLead: (id: string): Lead | undefined =>
    currentDemoState.leads.find((l) => l.id === id),
  createLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Lead => {
    const newLead: Lead = {
      ...lead,
      id: `demo-lead-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    currentDemoState.leads = [newLead, ...currentDemoState.leads];
    
    // Auto-create lead_created activity
    const activity: Activity = {
      id: `demo-act-${Date.now()}`,
      lead_id: newLead.id,
      type: 'lead_created',
      description: `Lead created manually for ${newLead.first_name} ${newLead.last_name ?? ''}`.trim(),
      metadata: { source: newLead.source },
      created_at: new Date().toISOString(),
    };
    currentDemoState.activities = [activity, ...currentDemoState.activities];

    saveDemoState();
    return newLead;
  },
  updateLead: (id: string, updates: Partial<Lead>): Lead => {
    const index = currentDemoState.leads.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Lead not found in demo data');
    
    const existing = currentDemoState.leads[index];
    const updatedLead: Lead = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    currentDemoState.leads[index] = updatedLead;

    if (updates.status && updates.status !== existing.status) {
      const act: Activity = {
        id: `demo-act-${Date.now()}`,
        lead_id: id,
        type: 'status_changed',
        description: `Lead status updated from "${existing.status}" to "${updates.status}"`,
        metadata: { old_status: existing.status, new_status: updates.status },
        created_at: new Date().toISOString(),
      };
      currentDemoState.activities = [act, ...currentDemoState.activities];
    }

    saveDemoState();
    return updatedLead;
  },
  deleteLead: (id: string): void => {
    currentDemoState.leads = currentDemoState.leads.filter((l) => l.id !== id);
    currentDemoState.activities = currentDemoState.activities.filter((a) => a.lead_id !== id);
    currentDemoState.followUps = currentDemoState.followUps.filter((f) => f.lead_id !== id);
    saveDemoState();
  },
  getActivities: (leadId?: string): Activity[] => {
    if (leadId) {
      return currentDemoState.activities.filter((a) => a.lead_id === leadId);
    }
    return [...currentDemoState.activities];
  },
  createActivity: (act: Omit<Activity, 'id' | 'created_at'>): Activity => {
    const newAct: Activity = {
      ...act,
      id: `demo-act-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    currentDemoState.activities = [newAct, ...currentDemoState.activities];
    saveDemoState();
    return newAct;
  },
  getFollowUps: (leadId?: string): FollowUp[] => {
    let list = currentDemoState.followUps;
    if (leadId) {
      list = list.filter((f) => f.lead_id === leadId);
    }
    return list.map((f) => {
      const lead = currentDemoState.leads.find((l) => l.id === f.lead_id);
      return {
        ...f,
        lead: lead
          ? {
              first_name: lead.first_name,
              last_name: lead.last_name,
              company_name: lead.company_name,
              email: lead.email,
            }
          : undefined,
      };
    });
  },
  createFollowUp: (fup: Omit<FollowUp, 'id' | 'created_at' | 'completed_at' | 'lead'>): FollowUp => {
    const lead = currentDemoState.leads.find((l) => l.id === fup.lead_id);
    const newFup: FollowUp = {
      ...fup,
      id: `demo-fup-${Date.now()}`,
      created_at: new Date().toISOString(),
      completed_at: null,
      lead: lead
        ? {
            first_name: lead.first_name,
            last_name: lead.last_name,
            company_name: lead.company_name,
            email: lead.email,
          }
        : undefined,
    };
    currentDemoState.followUps = [newFup, ...currentDemoState.followUps];

    // Log follow_up_scheduled activity
    const act: Activity = {
      id: `demo-act-${Date.now()}`,
      lead_id: fup.lead_id,
      type: 'follow_up_scheduled',
      description: `Follow-up scheduled via ${fup.channel} for ${new Date(fup.scheduled_for).toLocaleDateString()}`,
      metadata: { channel: fup.channel, scheduled_for: fup.scheduled_for },
      created_at: new Date().toISOString(),
    };
    currentDemoState.activities = [act, ...currentDemoState.activities];

    saveDemoState();
    return newFup;
  },
  updateFollowUp: (id: string, updates: Partial<FollowUp>): FollowUp => {
    const index = currentDemoState.followUps.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Follow-up not found');
    const existing = currentDemoState.followUps[index];
    const updated: FollowUp = {
      ...existing,
      ...updates,
      completed_at: updates.status === 'completed' ? new Date().toISOString() : existing.completed_at,
    };
    currentDemoState.followUps[index] = updated;

    if (updates.status === 'completed' && existing.status !== 'completed') {
      const act: Activity = {
        id: `demo-act-${Date.now()}`,
        lead_id: updated.lead_id,
        type: 'follow_up_completed',
        description: `Follow-up task marked completed (${updated.channel})`,
        metadata: { channel: updated.channel },
        created_at: new Date().toISOString(),
      };
      currentDemoState.activities = [act, ...currentDemoState.activities];
    }

    saveDemoState();
    return updated;
  },
  deleteFollowUp: (id: string): void => {
    currentDemoState.followUps = currentDemoState.followUps.filter((f) => f.id !== id);
    saveDemoState();
  },
  resetDemoData: () => {
    currentDemoState = {
      leads: INITIAL_DEMO_LEADS,
      activities: INITIAL_DEMO_ACTIVITIES,
      followUps: INITIAL_DEMO_FOLLOW_UPS,
      profile: DEMO_USER_PROFILE,
    };
    saveDemoState();
  },
};
