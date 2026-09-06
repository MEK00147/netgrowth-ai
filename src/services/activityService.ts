import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Activity, ActivityType } from '../types/database';
import { demoStore } from '../lib/demoData';
import { authService } from './authService';

export const activityService = {
  async getLeadActivities(leadId?: string): Promise<{ data: Activity[]; error: string | null }> {
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const activities = demoStore.getActivities(leadId);
        // Order by created_at desc
        activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { data: activities, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      let query = supabase.from('activities').select('*');
      if (leadId) {
        query = query.eq('lead_id', leadId);
      }
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return { data: (data as Activity[]) ?? [], error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch lead activities';
      return { data: [], error: msg };
    }
  },

  async createActivity(
    leadId: string,
    type: ActivityType | string,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<{ data: Activity | null; error: string | null }> {
    try {
      if (!leadId) return { data: null, error: 'leadId is required' };
      if (!description?.trim()) return { data: null, error: 'Activity description is required' };

      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const created = demoStore.createActivity({
          lead_id: leadId,
          type,
          description: description.trim(),
          metadata: metadata ?? null,
        });
        return { data: created, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      const { data, error } = await supabase
        .from('activities')
        .insert({
          lead_id: leadId,
          type,
          description: description.trim(),
          metadata: metadata ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return { data: data as Activity, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record lead activity';
      return { data: null, error: msg };
    }
  },
};
