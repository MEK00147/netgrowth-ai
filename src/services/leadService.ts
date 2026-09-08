import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Lead, CreateLeadInput, UpdateLeadInput, DashboardMetrics, LeadStatus, LeadClassification } from '../types/database';
import { demoStore } from '../lib/demoData';
import { authService } from './authService';

export interface LeadFilterOptions {
  status?: LeadStatus | 'all';
  classification?: LeadClassification | 'all';
  search?: string;
  sortBy?: 'created_at_desc' | 'created_at_asc' | 'score_desc' | 'score_asc' | 'company_asc';
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const leadService = {
  async getLeads(filters?: LeadFilterOptions): Promise<{ data: Lead[]; error: string | null }> {
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        let list = demoStore.getLeads();

        if (filters?.status && filters.status !== 'all') {
          list = list.filter((l) => l.status === filters.status);
        }
        if (filters?.classification && filters.classification !== 'all') {
          list = list.filter((l) => l.classification === filters.classification);
        }
        if (filters?.search && filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          list = list.filter(
            (l) =>
              l.first_name.toLowerCase().includes(q) ||
              (l.last_name && l.last_name.toLowerCase().includes(q)) ||
              l.email.toLowerCase().includes(q) ||
              (l.company_name && l.company_name.toLowerCase().includes(q)) ||
              (l.inquiry && l.inquiry.toLowerCase().includes(q))
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
          // default created_at_desc
          list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return { data: list, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      let query = supabase.from('leads').select('*');

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.classification && filters.classification !== 'all') {
        query = query.eq('classification', filters.classification);
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.trim();
        query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,company_name.ilike.%${q}%,email.ilike.%${q}%`);
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
      return { data: (data as Lead[]) ?? [], error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch leads';
      return { data: [], error: msg };
    }
  },

  async getLead(id: string): Promise<{ data: Lead | null; error: string | null }> {
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const found = demoStore.getLead(id);
        if (!found) return { data: null, error: 'Lead not found' };
        return { data: found, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { data: null, error: 'Lead not found' };

      return { data: data as Lead, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve lead details';
      return { data: null, error: msg };
    }
  },

  async createLead(leadInput: CreateLeadInput): Promise<{ data: Lead | null; error: string | null }> {
    try {
      if (!leadInput.first_name?.trim()) {
        return { data: null, error: 'First name is required' };
      }
      const email = leadInput.email?.trim().toLowerCase();
      if (!email || !EMAIL_PATTERN.test(email)) {
        return { data: null, error: 'A valid email address is required' };
      }
      if (!leadInput.inquiry?.trim()) {
        return { data: null, error: 'Inquiry details are required' };
      }

      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const created = demoStore.createLead({
          owner_id: demoStore.getProfile().id,
          first_name: leadInput.first_name.trim(),
          last_name: leadInput.last_name?.trim() || null,
          email,
          phone: leadInput.phone?.trim() || null,
          company_name: leadInput.company_name?.trim() || null,
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
          classification: leadInput.classification ?? null,
          ai_summary: null,
          ai_pain_points: null,
          ai_buying_signals: null,
          ai_recommended_action: null,
        });
        return { data: created, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      const { data: userData } = await supabase.auth.getUser();
      const resolvedOwnerId = userData.user?.id;

      if (!resolvedOwnerId) {
        throw new Error('Authenticated user session required to assign lead ownership');
      }

      const insertPayload = {
        owner_id: resolvedOwnerId,
        first_name: leadInput.first_name.trim(),
        last_name: leadInput.last_name?.trim() || null,
        email,
        phone: leadInput.phone?.trim() || null,
        company_name: leadInput.company_name?.trim() || null,
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
        classification: leadInput.classification ?? null,
      };

      const { data, error } = await supabase
        .from('leads')
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;

      // Automatically record activity log
      await supabase.from('activities').insert({
        lead_id: data.id,
        type: 'lead_created',
        description: `Lead created for ${data.first_name} ${data.last_name ?? ''}`.trim(),
        metadata: { source: data.source },
      });

      return { data: data as Lead, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create lead';
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

      // Fetch existing to check if status changed
      const { data: existing } = await supabase.from('leads').select('status').eq('id', id).single();

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

      // Log status change if applicable
      if (updates.status && existing && existing.status !== updates.status) {
        await supabase.from('activities').insert({
          lead_id: id,
          type: 'status_changed',
          description: `Lead status updated from "${existing.status}" to "${updates.status}"`,
          metadata: { old_status: existing.status, new_status: updates.status },
        });
      } else {
        await supabase.from('activities').insert({
          lead_id: id,
          type: 'lead_updated',
          description: 'Lead profile updated',
          metadata: { updated_fields: Object.keys(updates) },
        });
      }

      return { data: data as Lead, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update lead';
      return { data: null, error: msg };
    }
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
      const hotLeads = leads.filter((l) => l.classification === 'hot').length;
      const warmLeads = leads.filter((l) => l.classification === 'warm').length;
      const coldLeads = leads.filter((l) => l.classification === 'cold').length;
      const newLeads = leads.filter((l) => l.status === 'new').length;

      const scoredLeads = leads.filter((l) => typeof l.score === 'number');
      const averageScore = scoredLeads.length > 0
        ? Math.round(scoredLeads.reduce((acc, curr) => acc + (curr.score ?? 0), 0) / scoredLeads.length)
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
