import { Lead, OrganizationMember } from '../../types/database';

export type AssignmentMethod =
  | 'manual'
  | 'round_robin'
  | 'workload'
  | 'availability'
  | 'category'
  | 'location';

export interface AssignLeadParams {
  leadId: string;
  salespersonId: string;
  assignedByUserId: string;
  organizationId: string;
  notes?: string;
}

export interface AssignmentResult {
  success: boolean;
  lead?: Lead | null;
  assignedSalesperson?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  previousSalesperson?: {
    id: string;
    fullName: string;
  } | null;
  error?: string | null;
  strategyUsed: AssignmentMethod;
}

export interface AssignmentStrategy {
  readonly name: AssignmentMethod;
  assign(params: AssignLeadParams): Promise<AssignmentResult>;
}

export interface SalespersonWorkload {
  member: OrganizationMember;
  activeLeadsCount: number;
  hotLeadsCount: number;
  lastAssignedAt?: string | null;
}
