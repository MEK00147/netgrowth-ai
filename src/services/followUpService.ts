import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FollowUp, CreateFollowUpInput, FollowUpStatus } from '../types/database';
import { demoStore } from '../lib/demoData';
import { authService } from './authService';

export const followUpService = {
  async getFollowUps(leadId?: string, statusFilter?: FollowUpStatus | 'all'): Promise<{ data: FollowUp[]; error: string | null }> {
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        let list = demoStore.getFollowUps(leadId);
        if (statusFilter && statusFilter !== 'all') {
          list = list.filter((f) => f.status === statusFilter);
        }
        list.sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
        return { data: list, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      let query = supabase
        .from('follow_ups')
        .select(`
          id,
          lead_id,
          scheduled_for,
          status,
          channel,
          notes,
          created_at,
          completed_at,
          lead:leads (
            first_name,
            last_name,
            company_name,
            email
          )
        `);

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      query = query.order('scheduled_for', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      
      // Flatten lead join if returned as array
      const formatted: FollowUp[] = (data || []).map((item: any) => ({
        ...item,
        lead: Array.isArray(item.lead) ? item.lead[0] : item.lead,
      }));

      return { data: formatted, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch follow-ups';
      return { data: [], error: msg };
    }
  },

  async createFollowUp(input: CreateFollowUpInput): Promise<{ data: FollowUp | null; error: string | null }> {
    try {
      if (!input.lead_id) return { data: null, error: 'Target lead is required' };
      if (!input.scheduled_for) return { data: null, error: 'Scheduled date and time are required' };
      if (!input.channel) return { data: null, error: 'Communication channel is required' };

      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const created = demoStore.createFollowUp({
          lead_id: input.lead_id,
          scheduled_for: input.scheduled_for,
          channel: input.channel,
          notes: input.notes ?? null,
          status: input.status ?? 'scheduled',
        });
        return { data: created, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      const { data, error } = await supabase
        .from('follow_ups')
        .insert({
          lead_id: input.lead_id,
          scheduled_for: input.scheduled_for,
          channel: input.channel,
          notes: input.notes ?? null,
          status: input.status ?? 'scheduled',
        })
        .select(`
          id,
          lead_id,
          scheduled_for,
          status,
          channel,
          notes,
          created_at,
          completed_at,
          lead:leads (
            first_name,
            last_name,
            company_name,
            email
          )
        `)
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        lead_id: input.lead_id,
        type: 'follow_up_scheduled',
        description: `Follow-up scheduled via ${input.channel} for ${new Date(input.scheduled_for).toLocaleDateString()}`,
        metadata: { channel: input.channel, scheduled_for: input.scheduled_for },
      });

      const formatted: FollowUp = {
        ...data,
        lead: Array.isArray((data as any).lead) ? (data as any).lead[0] : (data as any).lead,
      };

      return { data: formatted, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to schedule follow-up';
      return { data: null, error: msg };
    }
  },

  async updateFollowUp(id: string, updates: Partial<FollowUp>): Promise<{ data: FollowUp | null; error: string | null }> {
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const updated = demoStore.updateFollowUp(id, updates);
        return { data: updated, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      const payload: Record<string, unknown> = { ...updates };
      if (updates.status === 'completed' && !updates.completed_at) {
        payload.completed_at = new Date().toISOString();
      }

      // Remove nested lead relation before update
      delete payload.lead;

      const { data, error } = await supabase
        .from('follow_ups')
        .update(payload)
        .eq('id', id)
        .select(`
          id,
          lead_id,
          scheduled_for,
          status,
          channel,
          notes,
          created_at,
          completed_at,
          lead:leads (
            first_name,
            last_name,
            company_name,
            email
          )
        `)
        .single();

      if (error) throw error;

      // If status changed to completed, log activity
      if (updates.status === 'completed') {
        await supabase.from('activities').insert({
          lead_id: data.lead_id,
          type: 'follow_up_completed',
          description: `Follow-up marked completed (${data.channel})`,
          metadata: { channel: data.channel },
        });
      }

      const formatted: FollowUp = {
        ...data,
        lead: Array.isArray((data as any).lead) ? (data as any).lead[0] : (data as any).lead,
      };

      return { data: formatted, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update follow-up';
      return { data: null, error: msg };
    }
  },

  async deleteFollowUp(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        demoStore.deleteFollowUp(id);
        return { success: true, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      const { error } = await supabase.from('follow_ups').delete().eq('id', id);
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete follow-up';
      return { success: false, error: msg };
    }
  },
};
