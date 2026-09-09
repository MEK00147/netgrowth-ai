import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
  DashboardMetrics,
  LeadStatus,
  LeadClassification,
  Profile,
} from '../types/database';
import { demoStore } from '../lib/demoData';
import { authService } from './authService';
import { assignmentService } from './assignment/assignmentService';

export interface LeadFilterOptions {
  status?: LeadStatus | 'all';
  classification?: LeadClassification | 'all';
  search?: string;
  assignedTo?: string | 'all' | 'unassigned';
  sortBy?: 'created_at_desc' | 'created_at_asc' | 'score_desc' | 'score_asc' | 'company_asc';
}

export const leadService = {
  async getLeads(filters?: LeadFilterOptions): Promise<{ data: Lead[]; error: string | null }> {
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        // Enforce demo store RLS & role-based lead isolation
        let list = demoStore.getLeads();

        if (filters?.status && filters.status !== 'all') {
          list = list.filter((l) => l.status === filters.status);
        }
        if (filters?.classification && filters.classification !== 'all') {
          list = list.filter(
            (l) => l.classification === filters.classification || l.temperature === filters.classification
          );
        }
        if (filters?.assignedTo && filters.assignedTo !== 'all') {
          if (filters.assignedTo === 'unassigned') {
            list = list.filter((l) => !l.assigned_to);
          } else {
            list = list.filter((l) => l.assigned_to === filters.assignedTo);
          }
        }
        if (filters?.search && filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          list = list.filter(
            (l) =>
              l.first_name.toLowerCase().includes(q) ||
              (l.last_name && l.last_name.toLowerCase().includes(q)) ||
              (l.full_name && l.full_name.toLowerCase().includes(q)) ||
              l.email.toLowerCase().includes(q) ||
              (l.company_name && l.company_name.toLowerCase().includes(q)) ||
              (l.inquiry && l.inquiry.toLowerCase().includes(q)) ||
              (l.service_interest && l.service_interest.toLowerCase().includes(q))
          );
        }

        // Sorting
        if (filters?.sortBy === 'created_at_asc') {
          list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        } else if (filters?.sortBy === 'score_desc') {
          list.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
        } else if (filters?.sortBy === 'score_asc') {
          list.sort((a, b) => (a.score ?? 101) - (b.score ?? 101));
        } else if (filters?.sortBy === 'company_asc') {
          list.sort((a, b) => (a.company_name ?? '').localeCompare(b.company_name ?? ''));
        } else {
          // Default created_at_desc
          list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return { data: list, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      // Live Supabase query: PostgreSQL Row Level Security (RLS) automatically
      // limits rows to the user's organization and assigned scope.
      let query = supabase.from('leads').select('*');

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.classification && filters.classification !== 'all') {
        query = query.eq('classification', filters.classification);
      }
      if (filters?.assignedTo && filters.assignedTo !== 'all') {
        if (filters.assignedTo === 'unassigned') {
          query = query.is('assigned_to', null);
        } else {
          query = query.eq('assigned_to', filters.assignedTo);
        }
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.trim();
        query = query.or(
          `first_name.ilike.%${q}%,last_name.ilike.%${q}%,company_name.ilike.%${q}%,email.ilike.%${q}%,inquiry.ilike.%${q}%`
        );
      }

      // Sorting
      if (filters?.sortBy === 'created_at_asc') {
        query = query.order('created_at', { ascending: true });
      } else if (filters?.sortBy === 'score_desc') {
        query = query.order('score', { ascending: false, nullsFirst: false });
      } else if (filters?.sortBy === 'score_asc') {
        query = query.order('score', { ascending: true, nullsFirst: true });
      } else if (filters?.sortBy === 'company_asc') {
        query = query.order('company_name', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      // Resiliently fetch assigned profiles without relying on brittle PostgREST foreign key hint names
      const assignedUserIds = Array.from(
        new Set(
          (data || [])
            .map((row: any) => (row.assigned_to as string) || (row.owner_id as string))
            .filter(Boolean)
        )
      );

      let profileMap: Record<string, Profile> = {};
      if (assignedUserIds.length > 0) {
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, full_name, company_name, avatar_url')
            .in('id', assignedUserIds);

          if (profiles) {
            profileMap = profiles.reduce<Record<string, Profile>>((acc, p) => {
              acc[p.id] = p as Profile;
              return acc;
            }, {});
          }
        } catch {
          // Ignore profile mapping error to avoid breaking lead listing
        }
      }

      const formatted = (data || []).map((row: any) => {
        const assignedId = (row.assigned_to as string) || (row.owner_id as string);
        const assignedProfile = assignedId ? profileMap[assignedId] || null : null;
        return {
          ...row,
          assigned_to: row.assigned_to || row.owner_id || null,
          assigned_user: assignedProfile,
        } as Lead;
      });

      return { data: formatted, error: null };
    } catch (err: unknown) {
      const msg = (err as any)?.message || (err instanceof Error ? err.message : 'Failed to fetch leads');
      console.error('leadService.getLeads error:', err);
      return { data: [], error: msg };
    }
  },

  async getLead(id: string): Promise<{ data: Lead | null; error: string | null }> {
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const found = demoStore.getLead(id);
        if (!found) {
          return {
            data: null,
            error: 'Security access denied: You do not have permission to view this lead, or it belongs to another organization.',
          };
        }
        return { data: found, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      // Live Supabase: RLS filters out rows outside org or not assigned to sales user
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return {
          data: null,
          error: 'Security access denied: Lead does not exist or you lack authorization to access it.',
        };
      }

      const assignedId = (data.assigned_to as string) || (data.owner_id as string);
      let assignedProfile: Profile | null = null;
      if (assignedId) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, email, full_name, company_name, avatar_url')
            .eq('id', assignedId)
            .maybeSingle();
          if (profile) assignedProfile = profile as Profile;
        } catch {
          // ignore profile lookup failure
        }
      }

      const lead: Lead = {
        ...data,
        assigned_to: data.assigned_to || data.owner_id || null,
        assigned_user: assignedProfile,
      };

      return { data: lead, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve lead details';
      return { data: null, error: msg };
    }
  },

  async createLead(
    leadInput: CreateLeadInput,
    organizationId?: string,
    createdByUserId?: string
  ): Promise<{ data: Lead | null; error: string | null }> {
    try {
      if (!leadInput.first_name?.trim()) {
        return { data: null, error: 'First name is required' };
      }
      if (!leadInput.email?.trim()) {
        return { data: null, error: 'Email address is required' };
      }
      if (!leadInput.inquiry?.trim()) {
        return { data: null, error: 'Inquiry details are required' };
      }

      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const created = demoStore.createLead(leadInput, createdByUserId);
        return { data: created, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      let resolvedUserId = createdByUserId;
      if (!resolvedUserId) {
        const { data: userData } = await supabase.auth.getUser();
        resolvedUserId = userData.user?.id;
      }

      if (!resolvedUserId) {
        throw new Error('Authenticated user session required to create lead');
      }

      let resolvedOrgId = organizationId;
      if (!resolvedOrgId) {
        try {
          const { data: memberData } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', resolvedUserId)
            .maybeSingle();
          resolvedOrgId = memberData?.organization_id;
        } catch {
          // Table might not exist yet
        }
      }

      // If user has no organization yet, attempt to auto-create one for them
      if (!resolvedOrgId) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_name, full_name')
            .eq('id', resolvedUserId)
            .maybeSingle();

          const orgName = profile?.company_name || 'Primary Workspace';
          const { data: newOrg } = await supabase
            .from('organizations')
            .insert({ name: orgName })
            .select()
            .single();

          if (newOrg?.id) {
            resolvedOrgId = newOrg.id;
            await supabase.from('organization_members').insert({
              organization_id: newOrg.id,
              user_id: resolvedUserId,
              role: 'admin',
            });
          }
        } catch {
          // Organizations table might not exist yet in legacy setups
        }
      }

      const insertPayload: Record<string, any> = {
        created_by: resolvedUserId,
        owner_id: resolvedUserId,
        first_name: leadInput.first_name.trim(),
        last_name: leadInput.last_name?.trim() || null,
        full_name: `${leadInput.first_name.trim()} ${leadInput.last_name?.trim() || ''}`.trim(),
        email: leadInput.email.trim(),
        phone: leadInput.phone?.trim() || null,
        company_name: leadInput.company_name?.trim() || null,
        service_interest: leadInput.service_interest?.trim() || null,
        job_title: leadInput.job_title?.trim() || null,
        website: leadInput.website?.trim() || null,
        industry: leadInput.industry?.trim() || null,
        inquiry: leadInput.inquiry.trim(),
        budget: leadInput.budget ?? null,
        budget_currency: leadInput.budget_currency || 'NGN',
        timeline: leadInput.timeline || null,
        source: leadInput.source || 'Manual Entry',
        status: leadInput.status || 'new',
        score: leadInput.score ?? null,
        ai_score: leadInput.score ?? null,
        classification: leadInput.classification ?? null,
        temperature: leadInput.classification ?? null,
      };

      if (resolvedOrgId) {
        insertPayload.organization_id = resolvedOrgId;
      }
      if (leadInput.assigned_to) {
        insertPayload.assigned_to = leadInput.assigned_to;
      }

      let { data, error } = await supabase
        .from('leads')
        .insert(insertPayload)
        .select()
        .single();

      // Graceful fallback: If insertion failed due to missing columns in a legacy database schema,
      // retry with the baseline legacy columns to ensure lead intake never breaks
      if (error && (error.code === '42703' || error.message?.includes('does not exist'))) {
        const legacyPayload: Record<string, any> = {
          owner_id: resolvedUserId,
          first_name: leadInput.first_name.trim(),
          last_name: leadInput.last_name?.trim() || null,
          email: leadInput.email.trim(),
          phone: leadInput.phone?.trim() || null,
          company_name: leadInput.company_name?.trim() || null,
          job_title: leadInput.job_title?.trim() || null,
          website: leadInput.website?.trim() || null,
          industry: leadInput.industry?.trim() || null,
          inquiry: leadInput.inquiry.trim(),
          budget: leadInput.budget ?? null,
          budget_currency: leadInput.budget_currency || 'NGN',
          source: leadInput.source || 'Manual Entry',
          status: leadInput.status || 'new',
          score: leadInput.score ?? null,
          classification: leadInput.classification ?? null,
        };
        const retryResult = await supabase.from('leads').insert(legacyPayload).select().single();
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) throw error;

      // Automatically record activity log (non-blocking)
      try {
        await supabase.from('activities').insert({
          lead_id: data.id,
          organization_id: resolvedOrgId || null,
          user_id: resolvedUserId,
          type: 'lead_created',
          activity_type: 'lead_created',
          description: `Lead created for ${data.first_name} ${data.last_name ?? ''}`.trim(),
          metadata: { source: data.source },
        });
      } catch {
        // Activity log is non-blocking
      }

      return { data: data as Lead, error: null };
    } catch (err: unknown) {
      const msg = (err as any)?.message || (err instanceof Error ? err.message : 'Failed to create lead');
      return { data: null, error: msg };
    }
  },

  async updateLead(id: string, updates: UpdateLeadInput): Promise<{ data: Lead | null; error: string | null }> {
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const updated = demoStore.updateLead(id, updates);
        return { data: updated, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      const { data: existing } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      const { data, error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log status change if applicable (non-blocking)
      try {
        if (updates.status && existing && existing.status !== updates.status) {
          await supabase.from('activities').insert({
            lead_id: id,
            organization_id: existing.organization_id || null,
            type: 'status_changed',
            activity_type: 'status_changed',
            description: `Lead status updated from "${existing.status}" to "${updates.status}"`,
            metadata: { old_status: existing.status, new_status: updates.status },
          });
        } else {
          await supabase.from('activities').insert({
            lead_id: id,
            organization_id: existing?.organization_id || null,
            type: 'lead_updated',
            activity_type: 'lead_updated',
            description: 'Lead details updated',
            metadata: { updated_fields: Object.keys(updates) },
          });
        }
      } catch {
        // Activity log is non-blocking
      }

      return { data: data as Lead, error: null };
    } catch (err: unknown) {
      const msg = (err as any)?.message || (err instanceof Error ? err.message : 'Failed to update lead');
      return { data: null, error: msg };
    }
  },

  async assignLead(
    leadId: string,
    salespersonId: string,
    assignedByUserId: string,
    organizationId: string,
    notes?: string
  ) {
    return assignmentService.assignLead({
      leadId,
      salespersonId,
      assignedByUserId,
      organizationId,
      notes,
    });
  },

  async deleteLead(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        demoStore.deleteLead(id);
        return { success: true, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete lead';
      return { success: false, error: msg };
    }
  },

  async getDashboardMetrics(): Promise<{ metrics: DashboardMetrics; error: string | null }> {
    try {
      const { data: leads, error } = await this.getLeads();
      if (error) throw new Error(error);

      const totalLeads = leads.length;
      const hotLeads = leads.filter((l) => l.classification === 'hot' || l.temperature === 'hot').length;
      const warmLeads = leads.filter((l) => l.classification === 'warm' || l.temperature === 'warm').length;
      const coldLeads = leads.filter((l) => l.classification === 'cold' || l.temperature === 'cold').length;
      const newLeads = leads.filter((l) => l.status === 'new').length;

      const scoredLeads = leads.filter((l) => typeof l.score === 'number' || typeof l.ai_score === 'number');
      const averageScore =
        scoredLeads.length > 0
          ? Math.round(
              scoredLeads.reduce((acc, curr) => acc + (curr.score ?? curr.ai_score ?? 0), 0) /
                scoredLeads.length
            )
          : null;

      return {
        metrics: {
          totalLeads,
          hotLeads,
          warmLeads,
          coldLeads,
          newLeads,
          averageScore,
        },
        error: null,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to compute dashboard metrics';
      return {
        metrics: {
          totalLeads: 0,
          hotLeads: 0,
          warmLeads: 0,
          coldLeads: 0,
          newLeads: 0,
          averageScore: null,
        },
        error: msg,
      };
    }
  },
};
