import { Lead, Activity, FollowUp, Profile, Organization, OrganizationMember, UserRole } from '../types/database';

export const DEMO_ORGANIZATION: Organization = {
  id: 'demo-org-apex-001',
  name: 'Apex Growth Dynamics',
  created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
};

export const DEMO_PERSONAS: { profile: Profile; role: UserRole }[] = [
  {
    profile: {
      id: 'demo-user-00000000-0000-0000-0000-000000000001',
      email: 'alex.director@acmecorp.com',
      full_name: 'Alex Rivera',
      company_name: 'Apex Growth Dynamics',
      avatar_url: null,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    role: 'admin',
  },
  {
    profile: {
      id: 'demo-user-00000000-0000-0000-0000-000000000002',
      email: 'sarah.chen@acmecorp.com',
      full_name: 'Sarah Chen',
      company_name: 'Apex Growth Dynamics',
      avatar_url: null,
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    role: 'sales',
  },
  {
    profile: {
      id: 'demo-user-00000000-0000-0000-0000-000000000003',
      email: 'marcus.vance@acmecorp.com',
      full_name: 'Marcus Vance',
      company_name: 'Apex Growth Dynamics',
      avatar_url: null,
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    role: 'sales',
  },
];

export const DEMO_USER_PROFILE: Profile = DEMO_PERSONAS[0].profile;

export const INITIAL_DEMO_LEADS: Lead[] = [
  {
    id: 'demo-lead-101',
    organization_id: DEMO_ORGANIZATION.id,
    created_by: DEMO_PERSONAS[0].profile.id,
    assigned_to: DEMO_PERSONAS[1].profile.id, // Assigned to Sarah Chen
    owner_id: DEMO_PERSONAS[0].profile.id,
    first_name: 'Chidi',
    last_name: 'Okonkwo',
    full_name: 'Chidi Okonkwo',
    email: 'chidi.okonkwo@lagosfintech.ng',
    phone: '+234 803 123 4567',
    company_name: 'Lagos Fintech Solutions',
    service_interest: 'Enterprise AI Lead Qualification API',
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
    ai_score: 92,
    classification: 'hot',
    temperature: 'hot',
    ai_summary: null,
    ai_pain_points: null,
    ai_buying_signals: null,
    ai_recommended_action: null,
    assigned_user: DEMO_PERSONAS[1].profile,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'demo-lead-102',
    organization_id: DEMO_ORGANIZATION.id,
    created_by: DEMO_PERSONAS[0].profile.id,
    assigned_to: DEMO_PERSONAS[2].profile.id, // Assigned to Marcus Vance
    owner_id: DEMO_PERSONAS[0].profile.id,
    first_name: 'Fatima',
    last_name: 'Bello',
    full_name: 'Fatima Bello',
    email: 'fatima@sahara-logistics.com',
    phone: '+234 812 987 6543',
    company_name: 'Sahara Cold-Chain Logistics',
    service_interest: 'Multi-Hub Inbound Dispatch Automation',
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
    ai_score: 74,
    classification: 'warm',
    temperature: 'warm',
    ai_summary: null,
    ai_pain_points: null,
    ai_buying_signals: null,
    ai_recommended_action: null,
    assigned_user: DEMO_PERSONAS[2].profile,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'demo-lead-103',
    organization_id: DEMO_ORGANIZATION.id,
    created_by: DEMO_PERSONAS[0].profile.id,
    assigned_to: DEMO_PERSONAS[1].profile.id, // Assigned to Sarah Chen
    owner_id: DEMO_PERSONAS[0].profile.id,
    first_name: 'David',
    last_name: 'Adeyemi',
    full_name: 'David Adeyemi',
    email: 'david@greenfieldagri.co',
    phone: '+234 705 555 0192',
    company_name: 'Greenfield Agri Export',
    service_interest: 'Commodity Export Inbound CRM',
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
    ai_score: 38,
    classification: 'cold',
    temperature: 'cold',
    ai_summary: null,
    ai_pain_points: null,
    ai_buying_signals: null,
    ai_recommended_action: null,
    assigned_user: DEMO_PERSONAS[1].profile,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'demo-lead-104',
    organization_id: DEMO_ORGANIZATION.id,
    created_by: DEMO_PERSONAS[0].profile.id,
    assigned_to: DEMO_PERSONAS[2].profile.id, // Assigned to Marcus Vance
    owner_id: DEMO_PERSONAS[0].profile.id,
    first_name: 'Zainab',
    last_name: 'Ibrahim',
    full_name: 'Zainab Ibrahim',
    email: 'z.ibrahim@pulsehealth.io',
    phone: '+234 809 333 4444',
    company_name: 'PulseHealth Africa',
    service_interest: 'Automated Patient Triage & Clinic Booking',
    job_title: 'Head of Growth',
    website: 'https://pulsehealth.io',
    industry: 'Healthcare Technology',
    inquiry: 'We operate 14 diagnostic centers and receive 300+ inquiries daily via WhatsApp and web. Urgent requirement for automated prioritization.',
    budget: 12000000,
    budget_currency: 'NGN',
    timeline: 'Immediate',
    source: 'Direct Referral',
    status: 'proposal_sent',
    score: 88,
    ai_score: 88,
    classification: 'hot',
    temperature: 'hot',
    ai_summary: null,
    ai_pain_points: null,
    ai_buying_signals: null,
    ai_recommended_action: null,
    assigned_user: DEMO_PERSONAS[2].profile,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'demo-lead-105',
    organization_id: DEMO_ORGANIZATION.id,
    created_by: DEMO_PERSONAS[0].profile.id,
    assigned_to: null, // Unassigned — ready for Admin to assign
    owner_id: DEMO_PERSONAS[0].profile.id,
    first_name: 'Emeka',
    last_name: 'Nnamdi',
    full_name: 'Emeka Nnamdi',
    email: 'emeka@crestviewcapital.com',
    phone: '+234 802 777 8899',
    company_name: 'Crestview Private Equity',
    service_interest: 'Deal Flow Tracking & Inbound Screening',
    job_title: 'Investment Principal',
    website: 'https://crestviewcapital.com',
    industry: 'Financial Services',
    inquiry: 'Looking for a dedicated pipeline system to track proprietary deal sourcing and incoming pitch decks across sub-Saharan Africa.',
    budget: 6000000,
    budget_currency: 'NGN',
    timeline: 'Within 30 days',
    source: 'Executive Referral',
    status: 'new',
    score: 65,
    ai_score: 65,
    classification: 'warm',
    temperature: 'warm',
    ai_summary: null,
    ai_pain_points: null,
    ai_buying_signals: null,
    ai_recommended_action: null,
    assigned_user: null,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  // Cross-tenant lead belonging to an entirely different organization
  {
    id: 'demo-lead-999-cross-tenant',
    organization_id: 'demo-org-other-999',
    created_by: 'demo-user-other-001',
    assigned_to: 'demo-user-other-001',
    owner_id: 'demo-user-other-001',
    first_name: 'Kofi',
    last_name: 'Mensah',
    full_name: 'Kofi Mensah',
    email: 'kofi@accraglobal.gh',
    phone: '+233 24 111 2222',
    company_name: 'Accra Global Logistics',
    service_interest: 'Customs Clearance Automation',
    job_title: 'Operations Director',
    website: 'https://accraglobal.gh',
    industry: 'Freight',
    inquiry: 'Private inquiry from another organization.',
    budget: 3000000,
    budget_currency: 'USD',
    timeline: 'Immediate',
    source: 'Confidential',
    status: 'qualified',
    score: 85,
    ai_score: 85,
    classification: 'hot',
    temperature: 'hot',
    ai_summary: null,
    ai_pain_points: null,
    ai_buying_signals: null,
    ai_recommended_action: null,
    assigned_user: null,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export const INITIAL_DEMO_ACTIVITIES: Activity[] = [
  {
    id: 'demo-act-1',
    lead_id: 'demo-lead-101',
    organization_id: DEMO_ORGANIZATION.id,
    user_id: DEMO_PERSONAS[0].profile.id,
    user_name: DEMO_PERSONAS[0].profile.full_name,
    type: 'lead_assigned',
    activity_type: 'lead_assigned',
    description: 'Lead assigned to Sarah Chen by Admin Alex Rivera',
    metadata: { assigned_to: DEMO_PERSONAS[1].profile.id, assigned_by: DEMO_PERSONAS[0].profile.id },
    created_at: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(),
  },
  {
    id: 'demo-act-2',
    lead_id: 'demo-lead-101',
    organization_id: DEMO_ORGANIZATION.id,
    user_id: DEMO_PERSONAS[1].profile.id,
    user_name: DEMO_PERSONAS[1].profile.full_name,
    type: 'status_changed',
    activity_type: 'status_changed',
    description: 'Status moved to "qualified" after preliminary requirements review',
    metadata: { old_status: 'new', new_status: 'qualified' },
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'demo-act-3',
    lead_id: 'demo-lead-102',
    organization_id: DEMO_ORGANIZATION.id,
    user_id: DEMO_PERSONAS[0].profile.id,
    user_name: DEMO_PERSONAS[0].profile.full_name,
    type: 'lead_assigned',
    activity_type: 'lead_assigned',
    description: 'Lead assigned to Marcus Vance by Admin Alex Rivera',
    metadata: { assigned_to: DEMO_PERSONAS[2].profile.id, assigned_by: DEMO_PERSONAS[0].profile.id },
    created_at: new Date(Date.now() - 4 * 86400000 + 1800000).toISOString(),
  },
  {
    id: 'demo-act-4',
    lead_id: 'demo-lead-104',
    organization_id: DEMO_ORGANIZATION.id,
    user_id: DEMO_PERSONAS[2].profile.id,
    user_name: DEMO_PERSONAS[2].profile.full_name,
    type: 'status_changed',
    activity_type: 'status_changed',
    description: 'Proposal sent: Enterprise Plan Tier 2',
    metadata: { old_status: 'meeting_scheduled', new_status: 'proposal_sent' },
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const INITIAL_DEMO_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'demo-fup-1',
    lead_id: 'demo-lead-101',
    scheduled_for: new Date(Date.now() + 2 * 3600000).toISOString(),
    status: 'scheduled',
    channel: 'meeting',
    notes: 'Technical scoping session with CTO Chidi Okonkwo',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 'demo-fup-2',
    lead_id: 'demo-lead-102',
    scheduled_for: new Date(Date.now() + 26 * 3600000).toISOString(),
    status: 'scheduled',
    channel: 'phone',
    notes: 'Follow up on West Africa hub deployment timeline',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 'demo-fup-3',
    lead_id: 'demo-lead-104',
    scheduled_for: new Date(Date.now() + 48 * 3600000).toISOString(),
    status: 'scheduled',
    channel: 'email',
    notes: 'Send revised commercial terms agreement for PulseHealth',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    completed_at: null,
  },
];

interface DemoStoreState {
  organization: Organization;
  activePersonaId: string;
  leads: Lead[];
  activities: Activity[];
  followUps: FollowUp[];
}

const DEMO_STORAGE_KEY = 'netgrowth_demo_store_v2';

const loadDemoState = (): DemoStoreState => {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.leads && parsed.organization) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read demo state from localStorage', e);
  }
  return {
    organization: DEMO_ORGANIZATION,
    activePersonaId: DEMO_PERSONAS[0].profile.id, // Defaults to Admin Alex Rivera
    leads: INITIAL_DEMO_LEADS,
    activities: INITIAL_DEMO_ACTIVITIES,
    followUps: INITIAL_DEMO_FOLLOW_UPS,
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
  getOrganization: (): Organization => ({ ...currentDemoState.organization }),

  getActivePersona: () => {
    const found = DEMO_PERSONAS.find((p) => p.profile.id === currentDemoState.activePersonaId);
    return found || DEMO_PERSONAS[0];
  },

  setActivePersona: (personaId: string) => {
    const found = DEMO_PERSONAS.find((p) => p.profile.id === personaId);
    if (found) {
      currentDemoState.activePersonaId = personaId;
      saveDemoState();
    }
  },

  getAvailablePersonas: () => DEMO_PERSONAS,

  getProfile: (): Profile => {
    const active = demoStore.getActivePersona();
    return { ...active.profile };
  },

  updateProfile: (updates: Partial<Profile>): Profile => {
    const active = demoStore.getActivePersona();
    const updated = { ...active.profile, ...updates, updated_at: new Date().toISOString() };
    const personaIndex = DEMO_PERSONAS.findIndex((p) => p.profile.id === active.profile.id);
    if (personaIndex >= 0) {
      DEMO_PERSONAS[personaIndex].profile = updated;
    }
    saveDemoState();
    return updated;
  },

  getUserOrgContext: (userId: string) => {
    const persona = DEMO_PERSONAS.find((p) => p.profile.id === userId) || demoStore.getActivePersona();
    return {
      organization: { ...currentDemoState.organization },
      role: persona.role,
      member: {
        id: `demo-member-${persona.profile.id}`,
        organization_id: currentDemoState.organization.id,
        user_id: persona.profile.id,
        role: persona.role,
        created_at: persona.profile.created_at,
        user: persona.profile,
      } as OrganizationMember,
    };
  },

  getOrganizationMembers: (organizationId: string): OrganizationMember[] => {
    if (organizationId !== currentDemoState.organization.id) return [];
    return DEMO_PERSONAS.map((p) => ({
      id: `demo-member-${p.profile.id}`,
      organization_id: currentDemoState.organization.id,
      user_id: p.profile.id,
      role: p.role,
      created_at: p.profile.created_at,
      user: p.profile,
    }));
  },

  /**
   * Enforced Lead Retrieval based on Persona and Role:
   * - Admin: views all organization leads.
   * - Sales: views ONLY leads assigned to their authenticated user ID.
   * - Cross-tenant leads (other organizations) are strictly isolated and never returned.
   */
  getLeads: (requestingUserId?: string): Lead[] => {
    const currentPersona = requestingUserId
      ? DEMO_PERSONAS.find((p) => p.profile.id === requestingUserId) || demoStore.getActivePersona()
      : demoStore.getActivePersona();

    // 1. Enforce organization boundary
    let orgLeads = currentDemoState.leads.filter(
      (l) => l.organization_id === currentDemoState.organization.id
    );

    // 2. Attach assigned_user relation dynamically
    orgLeads = orgLeads.map((lead) => {
      const assignedPersona = DEMO_PERSONAS.find((p) => p.profile.id === lead.assigned_to);
      return {
        ...lead,
        assigned_user: assignedPersona ? assignedPersona.profile : null,
      };
    });

    // 3. Enforce Role-Based Access Control
    if (currentPersona.role === 'sales') {
      return orgLeads.filter((l) => l.assigned_to === currentPersona.profile.id);
    }

    // Admin views all leads in organization
    return orgLeads;
  },

  /**
   * Enforced Single Lead Retrieval:
   * Sales users cannot view leads assigned to another salesperson or outside their organization.
   */
  getLead: (id: string, requestingUserId?: string): Lead | undefined => {
    const currentPersona = requestingUserId
      ? DEMO_PERSONAS.find((p) => p.profile.id === requestingUserId) || demoStore.getActivePersona()
      : demoStore.getActivePersona();

    const lead = currentDemoState.leads.find((l) => l.id === id);
    if (!lead) return undefined;

    // Cross-tenant check
    if (lead.organization_id !== currentDemoState.organization.id) {
      return undefined;
    }

    // Role-based check
    if (currentPersona.role === 'sales' && lead.assigned_to !== currentPersona.profile.id) {
      return undefined; // Blocked: Sales user cannot view another salesperson's lead
    }

    const assignedPersona = DEMO_PERSONAS.find((p) => p.profile.id === lead.assigned_to);
    return {
      ...lead,
      assigned_user: assignedPersona ? assignedPersona.profile : null,
    };
  },

  createLead: (leadInput: Partial<Lead>, requestingUserId?: string): Lead => {
    const currentPersona = requestingUserId
      ? DEMO_PERSONAS.find((p) => p.profile.id === requestingUserId) || demoStore.getActivePersona()
      : demoStore.getActivePersona();

    if (currentPersona.role === 'sales') {
      throw new Error('Security violation: Sales users are not authorized to create top-level organization leads.');
    }

    const newLead: Lead = {
      id: `demo-lead-${Date.now()}`,
      organization_id: currentDemoState.organization.id,
      created_by: currentPersona.profile.id,
      assigned_to: leadInput.assigned_to || null,
      owner_id: currentPersona.profile.id,
      first_name: leadInput.first_name || 'Inbound',
      last_name: leadInput.last_name || null,
      full_name: `${leadInput.first_name || ''} ${leadInput.last_name || ''}`.trim(),
      email: leadInput.email || '',
      phone: leadInput.phone || null,
      company_name: leadInput.company_name || null,
      service_interest: leadInput.service_interest || null,
      job_title: leadInput.job_title || null,
      website: leadInput.website || null,
      industry: leadInput.industry || null,
      inquiry: leadInput.inquiry || '',
      budget: leadInput.budget ?? null,
      budget_currency: leadInput.budget_currency || 'NGN',
      timeline: leadInput.timeline || null,
      source: leadInput.source || 'Manual Entry',
      status: leadInput.status || 'new',
      score: leadInput.score ?? null,
      ai_score: leadInput.score ?? null,
      classification: leadInput.classification ?? null,
      temperature: leadInput.classification ?? null,
      ai_summary: null,
      ai_pain_points: null,
      ai_buying_signals: null,
      ai_recommended_action: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    currentDemoState.leads = [newLead, ...currentDemoState.leads];

    const activity: Activity = {
      id: `demo-act-${Date.now()}`,
      lead_id: newLead.id,
      organization_id: currentDemoState.organization.id,
      user_id: currentPersona.profile.id,
      user_name: currentPersona.profile.full_name,
      type: 'lead_created',
      activity_type: 'lead_created',
      description: `Lead record created by Admin ${currentPersona.profile.full_name}`,
      metadata: { source: newLead.source },
      created_at: new Date().toISOString(),
    };
    currentDemoState.activities = [activity, ...currentDemoState.activities];

    saveDemoState();
    return newLead;
  },

  updateLead: (id: string, updates: Partial<Lead>, requestingUserId?: string): Lead => {
    const currentPersona = requestingUserId
      ? DEMO_PERSONAS.find((p) => p.profile.id === requestingUserId) || demoStore.getActivePersona()
      : demoStore.getActivePersona();

    const index = currentDemoState.leads.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Lead not found in demo data');

    const existing = currentDemoState.leads[index];

    // Verify organization
    if (existing.organization_id !== currentDemoState.organization.id) {
      throw new Error('Unauthorized: Cannot modify lead belonging to another organization');
    }

    // Role restrictions for sales users
    if (currentPersona.role === 'sales') {
      if (existing.assigned_to !== currentPersona.profile.id) {
        throw new Error('Security policy violation: Sales users can only update leads assigned to them');
      }
      if (updates.assigned_to !== undefined && updates.assigned_to !== existing.assigned_to) {
        throw new Error('Security policy violation: Sales users are strictly forbidden from assigning or reassigning leads');
      }
      if (updates.organization_id !== undefined && updates.organization_id !== existing.organization_id) {
        throw new Error('Security policy violation: Changing organization_id is strictly forbidden');
      }
    }

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
        organization_id: currentDemoState.organization.id,
        user_id: currentPersona.profile.id,
        user_name: currentPersona.profile.full_name,
        type: 'status_changed',
        activity_type: 'status_changed',
        description: `Lead status updated from "${existing.status}" to "${updates.status}" by ${currentPersona.profile.full_name}`,
        metadata: { old_status: existing.status, new_status: updates.status },
        created_at: new Date().toISOString(),
      };
      currentDemoState.activities = [act, ...currentDemoState.activities];
    }

    saveDemoState();
    return updatedLead;
  },

  deleteLead: (id: string, requestingUserId?: string): void => {
    const currentPersona = requestingUserId
      ? DEMO_PERSONAS.find((p) => p.profile.id === requestingUserId) || demoStore.getActivePersona()
      : demoStore.getActivePersona();

    if (currentPersona.role === 'sales') {
      throw new Error('Security policy violation: Sales users cannot delete leads');
    }

    currentDemoState.leads = currentDemoState.leads.filter((l) => l.id !== id);
    currentDemoState.activities = currentDemoState.activities.filter((a) => a.lead_id !== id);
    currentDemoState.followUps = currentDemoState.followUps.filter((f) => f.lead_id !== id);
    saveDemoState();
  },

  getActivities: (leadId?: string): Activity[] => {
    let list = currentDemoState.activities;
    if (leadId) {
      list = list.filter((a) => a.lead_id === leadId);
    }
    return [...list];
  },

  createActivity: (act: Omit<Activity, 'id' | 'created_at'>): Activity => {
    const activePersona = demoStore.getActivePersona();
    const newAct: Activity = {
      ...act,
      id: `demo-act-${Date.now()}`,
      organization_id: act.organization_id || currentDemoState.organization.id,
      user_id: act.user_id || activePersona.profile.id,
      user_name: act.user_name || activePersona.profile.full_name,
      created_at: new Date().toISOString(),
    };
    currentDemoState.activities = [newAct, ...currentDemoState.activities];
    saveDemoState();
    return newAct;
  },

  getFollowUps: (leadId?: string): FollowUp[] => {
    const activePersona = demoStore.getActivePersona();
    const accessibleLeads = demoStore.getLeads();
    const accessibleLeadIds = new Set(accessibleLeads.map((l) => l.id));

    let list = currentDemoState.followUps.filter((f) => accessibleLeadIds.has(f.lead_id));
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

    const act: Activity = {
      id: `demo-act-${Date.now()}`,
      lead_id: fup.lead_id,
      organization_id: currentDemoState.organization.id,
      type: 'follow_up_scheduled',
      activity_type: 'follow_up_scheduled',
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
        organization_id: currentDemoState.organization.id,
        type: 'follow_up_completed',
        activity_type: 'follow_up_completed',
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
      organization: DEMO_ORGANIZATION,
      activePersonaId: DEMO_PERSONAS[0].profile.id,
      leads: INITIAL_DEMO_LEADS,
      activities: INITIAL_DEMO_ACTIVITIES,
      followUps: INITIAL_DEMO_FOLLOW_UPS,
    };
    saveDemoState();
  },
};
