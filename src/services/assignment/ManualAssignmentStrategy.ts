import { AssignmentStrategy, AssignLeadParams, AssignmentResult } from './types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { demoStore } from '../../lib/demoData';
import { authService } from '../authService';
import { Lead } from '../../types/database';

export class ManualAssignmentStrategy implements AssignmentStrategy {
  readonly name = 'manual' as const;

  async assign(params: AssignLeadParams): Promise<AssignmentResult> {
    const { leadId, salespersonId, assignedByUserId, organizationId, notes } = params;

    try {
      if (!leadId) {
        return { success: false, error: 'Lead ID is required', strategyUsed: this.name };
      }
      if (!salespersonId) {
        return { success: false, error: 'Target salesperson ID is required', strategyUsed: this.name };
      }
      if (!organizationId) {
        return { success: false, error: 'Organization ID is required', strategyUsed: this.name };
      }

      // Demo Mode Execution
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        return this.assignInDemoMode(params);
      }

      // Live Supabase Execution
      if (!supabase) {
        throw new Error('Supabase client unavailable');
      }

      // 1. Verify assigner has admin role in organization
      const { data: assignerMember, error: assignerErr } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', assignedByUserId)
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (assignerErr) throw assignerErr;
      if (!assignerMember || assignerMember.role !== 'admin') {
        return {
          success: false,
          error: 'Security restriction: Only organization administrators are authorized to assign or reassign leads.',
          strategyUsed: this.name,
        };
      }

      // 2. Verify target assignee exists, belongs to same org, and has 'sales' role
      const { data: assigneeMember, error: assigneeErr } = await supabase
        .from('organization_members')
        .select('user_id, role, organization_id, profiles(id, email, full_name)')
        .eq('user_id', salespersonId)
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (assigneeErr) throw assigneeErr;
      if (!assigneeMember) {
        return {
          success: false,
          error: 'Validation failed: The selected salesperson is not a member of your organization.',
          strategyUsed: this.name,
        };
      }
      if (assigneeMember.role !== 'sales') {
        return {
          success: false,
          error: 'Validation failed: Selected member does not hold a designated sales role.',
          strategyUsed: this.name,
        };
      }

      // 3. Fetch current lead state to verify org and previous assignment
      const { data: currentLead, error: leadFetchErr } = await supabase
        .from('leads')
        .select('id, organization_id, assigned_to, first_name, last_name')
        .eq('id', leadId)
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (leadFetchErr) throw leadFetchErr;
      if (!currentLead) {
        return {
          success: false,
          error: 'Lead record was not found in your organization.',
          strategyUsed: this.name,
        };
      }

      const isReassign = Boolean(currentLead.assigned_to && currentLead.assigned_to !== salespersonId);
      const isSameSalesperson = currentLead.assigned_to === salespersonId;

      if (isSameSalesperson) {
        return {
          success: true,
          lead: currentLead as unknown as Lead,
          error: null,
          strategyUsed: this.name,
        };
      }

      // 4. Update lead assignment
      const { data: updatedLead, error: updateErr } = await supabase
        .from('leads')
        .update({
          assigned_to: salespersonId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Type helper for profiles relation
      const targetProfile = Array.isArray(assigneeMember.profiles)
        ? assigneeMember.profiles[0]
        : assigneeMember.profiles;

      const salesFullName = targetProfile?.full_name || 'Sales Representative';
      const salesEmail = targetProfile?.email || '';

      // 5. Insert activity log
      const activityType = isReassign ? 'lead_reassigned' : 'lead_assigned';
      const desc = isReassign
        ? `Lead reassigned to ${salesFullName} (${salesEmail})`
        : `Lead assigned to ${salesFullName} (${salesEmail})`;

      await supabase.from('activities').insert({
        lead_id: leadId,
        organization_id: organizationId,
        user_id: assignedByUserId,
        type: activityType,
        activity_type: activityType,
        description: notes ? `${desc}. Note: ${notes}` : desc,
        metadata: {
          previous_assigned_to: currentLead.assigned_to,
          assigned_to: salespersonId,
          assigned_by: assignedByUserId,
          notes: notes || null,
          strategy: this.name,
        },
      });

      return {
        success: true,
        lead: updatedLead as Lead,
        assignedSalesperson: {
          id: salespersonId,
          fullName: salesFullName,
          email: salesEmail,
        },
        strategyUsed: this.name,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Manual lead assignment failed';
      return {
        success: false,
        error: msg,
        strategyUsed: this.name,
      };
    }
  }

  private assignInDemoMode(params: AssignLeadParams): AssignmentResult {
    const { leadId, salespersonId, assignedByUserId, organizationId, notes } = params;

    // 1. Verify assigner role in demo store
    const members = demoStore.getOrganizationMembers(organizationId);
    const assigner = members.find((m) => m.user_id === assignedByUserId);

    if (!assigner || assigner.role !== 'admin') {
      return {
        success: false,
        error: 'Security restriction: Only organization administrators are authorized to assign or reassign leads.',
        strategyUsed: this.name,
      };
    }

    // 2. Verify target salesperson
    const targetMember = members.find((m) => m.user_id === salespersonId);
    if (!targetMember) {
      return {
        success: false,
        error: 'Validation failed: The selected salesperson is not a member of your organization.',
        strategyUsed: this.name,
      };
    }
    if (targetMember.role !== 'sales') {
      return {
        success: false,
        error: 'Validation failed: Selected member does not hold a designated sales role.',
        strategyUsed: this.name,
      };
    }

    // 3. Find lead in demo store
    const currentLead = demoStore.getLead(leadId);
    if (!currentLead || currentLead.organization_id !== organizationId) {
      return {
        success: false,
        error: 'Lead record was not found in your organization.',
        strategyUsed: this.name,
      };
    }

    const isReassign = Boolean(currentLead.assigned_to && currentLead.assigned_to !== salespersonId);
    const targetUser = targetMember.user;
    const salesFullName = targetUser?.full_name || 'Sales Representative';
    const salesEmail = targetUser?.email || '';

    // 4. Update lead
    const updatedLead = demoStore.updateLead(leadId, {
      assigned_to: salespersonId,
    });

    // 5. Record activity
    const activityType = isReassign ? 'lead_reassigned' : 'lead_assigned';
    const desc = isReassign
      ? `Lead reassigned to ${salesFullName} (${salesEmail})`
      : `Lead assigned to ${salesFullName} (${salesEmail})`;

    demoStore.createActivity({
      lead_id: leadId,
      organization_id: organizationId,
      user_id: assignedByUserId,
      type: activityType,
      activity_type: activityType,
      description: notes ? `${desc}. Note: ${notes}` : desc,
      metadata: {
        previous_assigned_to: currentLead.assigned_to,
        assigned_to: salespersonId,
        assigned_by: assignedByUserId,
        notes: notes || null,
        strategy: this.name,
      },
    });

    return {
      success: true,
      lead: updatedLead,
      assignedSalesperson: {
        id: salespersonId,
        fullName: salesFullName,
        email: salesEmail,
      },
      strategyUsed: this.name,
    };
  }
}
