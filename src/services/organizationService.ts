import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Organization, OrganizationMember, UserRole, Profile } from '../types/database';
import { demoStore } from '../lib/demoData';
import { authService } from './authService';

export interface UserOrganizationContext {
  organization: Organization | null;
  role: UserRole | null;
  member: OrganizationMember | null;
}

export const organizationService = {
  async getUserOrganization(userId: string): Promise<{
    data: UserOrganizationContext | null;
    error: string | null;
  }> {
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const context = demoStore.getUserOrgContext(userId);
        return { data: context, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      // Fetch member row joined with organizations table
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          organization_id,
          user_id,
          role,
          created_at,
          organizations (
            id,
            name,
            created_at
          )
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return { data: null, error: null };
      }

      const orgData = Array.isArray(data.organizations)
        ? data.organizations[0]
        : data.organizations;

      const organization: Organization = {
        id: orgData.id,
        name: orgData.name,
        created_at: orgData.created_at,
      };

      const member: OrganizationMember = {
        id: data.id,
        organization_id: data.organization_id,
        user_id: data.user_id,
        role: data.role as UserRole,
        created_at: data.created_at,
      };

      return {
        data: {
          organization,
          role: data.role as UserRole,
          member,
        },
        error: null,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve organization context';
      return { data: null, error: msg };
    }
  },

  async getOrganizationMembers(organizationId: string): Promise<{
    data: OrganizationMember[];
    error: string | null;
  }> {
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const members = demoStore.getOrganizationMembers(organizationId);
        return { data: members, error: null };
      }

      if (!supabase) throw new Error('Supabase client unavailable');

      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          organization_id,
          user_id,
          role,
          created_at,
          profiles (
            id,
            email,
            full_name,
            company_name,
            avatar_url
          )
        `)
        .eq('organization_id', organizationId);

      if (error) throw error;

      const members: OrganizationMember[] = (data || []).map((row) => {
        const profileData = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        return {
          id: row.id,
          organization_id: row.organization_id,
          user_id: row.user_id,
          role: row.role as UserRole,
          created_at: row.created_at,
          user: profileData as Profile | null,
        };
      });

      return { data: members, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch organization members';
      return { data: [], error: msg };
    }
  },

  async getSalespeople(organizationId: string): Promise<{
    data: OrganizationMember[];
    error: string | null;
  }> {
    const { data: allMembers, error } = await this.getOrganizationMembers(organizationId);
    if (error) return { data: [], error };
    const salespeople = allMembers.filter((m) => m.role === 'sales');
    return { data: salespeople, error: null };
  },
};
