import {
  AssignmentStrategy,
  AssignmentMethod,
  AssignLeadParams,
  AssignmentResult,
} from './types';
import { ManualAssignmentStrategy } from './ManualAssignmentStrategy';
import { OrganizationMember } from '../../types/database';
import { organizationService } from '../organizationService';

/**
 * Extensible Assignment Service
 * Manages lead distribution strategies across sales teams.
 * In V1, ManualAssignmentStrategy is active, with seamless registration for future algorithms.
 */
class AssignmentService {
  private strategies: Map<AssignmentMethod, AssignmentStrategy> = new Map();

  constructor() {
    // Register default V1 manual assignment strategy
    this.registerStrategy(new ManualAssignmentStrategy());
  }

  registerStrategy(strategy: AssignmentStrategy) {
    this.strategies.set(strategy.name, strategy);
  }

  getStrategy(method: AssignmentMethod): AssignmentStrategy {
    const strategy = this.strategies.get(method);
    if (!strategy) {
      throw new Error(`Assignment strategy "${method}" is not registered in LeadFlow.`);
    }
    return strategy;
  }

  /**
   * Assign a lead using the chosen strategy (defaults to 'manual')
   */
  async assignLead(
    params: AssignLeadParams,
    method: AssignmentMethod = 'manual'
  ): Promise<AssignmentResult> {
    const strategy = this.getStrategy(method);
    return strategy.assign(params);
  }

  /**
   * Fetch eligible salespeople for assignment within an organization
   */
  async getAssignableSalespeople(
    organizationId: string
  ): Promise<{ data: OrganizationMember[]; error: string | null }> {
    return organizationService.getSalespeople(organizationId);
  }
}

export const assignmentService = new AssignmentService();
