import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Activity, ActivityType } from '../types/database';
import { demoStore } from '../lib/demoData';
import { authService } from './authService';

export const activityService = {
  async getLeadActivities(leadId?: string): Promise<{ data: Activity[]; error: string | null }> {
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const activities = demoStore.getActivities(leadId);
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
    metadata?: Record<string, unknown>,
    organizationId?: string,
    userId?: string
  ): Promise<{ data: Activity | null; error: string | null }> {
    try {
      if (!leadId) return { data: null, error: 'leadId is required' };
      if (!description?.trim()) return { data: null, error: 'Activity description is required' };

      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const activePersona = demoStore.getActivePersona();
        const created = demoStore.createActivity({
          lead_id: leadId,
          organization_id: organizationId || demoStore.getOrganization().id,
          user_id: userId || activePersona.profile.id,
          user_name: activePersona.profile.full_name,
          type,
          activity_type: type,
          description: description.trim(),
          metadata: metadata ?? null,
        });
        return { data: created, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      let resolvedUserId = userId;
      if (!resolvedUserId) {
        const { data: authData } = await supabase.auth.getUser();
        resolvedUserId = authData.user?.id;
      }

      let resolvedOrgId = organizationId;
      if (!resolvedOrgId && resolvedUserId) {
        const { data: memberData } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', resolvedUserId)
          .maybeSingle();
        resolvedOrgId = memberData?.organization_id;
      }

      const { data, error } = await supabase
        .from('activities')
        .insert({
          lead_id: leadId,
          organization_id: resolvedOrgId,
          user_id: resolvedUserId,
          type,
          activity_type: type,
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
