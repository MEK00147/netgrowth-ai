import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { OrganizationMember } from '../types/database';
import { authService } from './authService';
import { demoStore } from '../lib/demoData';

export const organizationService = {
  async getMembers(organizationId: string): Promise<{ data: OrganizationMember[]; error: string | null }> {
    if (authService.isDemoSession() || !isSupabaseConfigured()) {
      const profile = demoStore.getProfile();
      return { data: [{ user_id: profile.id, role: 'admin', full_name: profile.full_name, email: profile.email }], error: null };
    }
    if (!supabase) return { data: [], error: 'Supabase client unavailable' };
    const { data: memberships, error } = await supabase.from('organization_members').select('user_id, role').eq('organization_id', organizationId).order('role');
    if (error) return { data: [], error: error.message };
    const ids = (memberships ?? []).map((member) => member.user_id);
    if (!ids.length) return { data: [], error: null };
    const { data: profiles, error: profileError } = await supabase.from('profiles').select('id, full_name, email').in('id', ids);
    if (profileError) return { data: [], error: profileError.message };
    const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
    return { data: (memberships ?? []).map((member) => ({ user_id: member.user_id, role: member.role, full_name: profileById.get(member.user_id)?.full_name ?? null, email: profileById.get(member.user_id)?.email ?? '' })), error: null };
  },
};
