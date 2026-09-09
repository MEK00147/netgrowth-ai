import React, { useState, useEffect } from 'react';
import { Lead, OrganizationMember } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import { assignmentService } from '../../services/assignment/assignmentService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Alert } from '../ui/Alert';
import { UserCheck, ShieldAlert, ArrowRight, UserPlus, Sparkles } from 'lucide-react';

interface AssignLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onAssigned: (updatedLead: Lead) => void;
}

export const AssignLeadModal: React.FC<AssignLeadModalProps> = ({
  isOpen,
  onClose,
  lead,
  onAssigned,
}) => {
  const { user, organization, isAdmin } = useAuth();
  const [salespeople, setSalespeople] = useState<OrganizationMember[]>([]);
  const [selectedSalespersonId, setSelectedSalespersonId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isReassign = Boolean(lead.assigned_to);

  useEffect(() => {
    if (!isOpen || !organization) return;

    const fetchSalespeople = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: err } = await assignmentService.getAssignableSalespeople(organization.id);
        if (err) throw new Error(err);

        // Strictly enforce that only active members with 'sales' role in the same organization can be selected
        const eligible = (data || []).filter(
          (m) => m.role === 'sales' && m.organization_id === organization.id
        );
        setSalespeople(eligible);

        // Preselect current assignee if applicable, or first salesperson
        if (lead.assigned_to && eligible.some((m) => m.user_id === lead.assigned_to)) {
          setSelectedSalespersonId(lead.assigned_to);
        } else if (eligible.length > 0) {
          setSelectedSalespersonId(eligible[0].user_id);
        } else {
          setSelectedSalespersonId('');
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to fetch salespeople');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalespeople();
  }, [isOpen, organization, lead.assigned_to]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('Permission denied: Only organization administrators can assign or reassign leads.');
      return;
    }
    if (!selectedSalespersonId) {
      setError('Please select a salesperson to assign this lead to.');
      return;
    }
    if (!organization || !user) {
      setError('Active organization session required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await assignmentService.assignLead({
        leadId: lead.id,
        salespersonId: selectedSalespersonId,
        assignedByUserId: user.id,
        organizationId: organization.id,
        notes: notes.trim() || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to assign lead');
      }

      if (result.lead) {
        onAssigned(result.lead);
      }
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lead assignment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSalesperson = salespeople.find((m) => m.user_id === lead.assigned_to);
  const targetSalesperson = salespeople.find((m) => m.user_id === selectedSalespersonId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReassign ? 'Reassign Lead' : 'Manual Lead Assignment'}
      description={`Assign ${lead.first_name} ${lead.last_name ?? ''} (${lead.company_name || lead.email}) to a qualified salesperson in ${organization?.name || 'your organization'}.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {!isAdmin && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Security Rule: Sales users cannot assign or reassign leads.</span>
          </div>
        )}

        {/* Current vs Target Preview */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Current Assignee:</span>
            <span className="font-semibold text-slate-800">
              {currentSalesperson?.user?.full_name || lead.assigned_user?.full_name || (
                <span className="text-amber-600 font-medium">Unassigned</span>
              )}
            </span>
          </div>
          {isReassign && targetSalesperson && targetSalesperson.user_id !== lead.assigned_to && (
            <div className="flex items-center justify-between text-xs text-indigo-600 pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5" /> Reassigning to:
              </span>
              <span className="font-bold">{targetSalesperson.user?.full_name}</span>
            </div>
          )}
        </div>

        {/* Salesperson Select Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Designated Salesperson <span className="text-rose-500">*</span>
          </label>
          {isLoading ? (
            <div className="py-2 text-xs text-slate-400">Loading active salespeople...</div>
          ) : salespeople.length === 0 ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              No active members with the sales role were found in {organization?.name}. Add sales members to your organization to assign leads.
            </div>
          ) : (
            <Select
              value={selectedSalespersonId}
              onChange={(e) => setSelectedSalespersonId(e.target.value)}
              disabled={!isAdmin || isSubmitting}
              className="text-xs"
            >
              {salespeople.map((sp) => (
                <option key={sp.user_id} value={sp.user_id}>
                  {sp.user?.full_name || 'Unnamed'} — {sp.user?.email} ({sp.role.toUpperCase()})
                </option>
              ))}
            </Select>
          )}
          <p className="text-[11px] text-slate-400 mt-1">
            Only active organization members holding the validated <code className="text-indigo-600">sales</code> role are eligible.
          </p>
        </div>

        {/* Assignment Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Internal Handoff Instructions / Notes (Optional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Prospect requested call on Tuesday 2 PM; high interest in enterprise tier."
            rows={3}
            className="text-xs"
            disabled={!isAdmin || isSubmitting}
          />
        </div>

        {/* Architecture Extensibility Hint */}
        <div className="p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-start gap-2 text-[11px] text-indigo-900">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>
            <strong>Manual Strategy (V1 Active):</strong> Assigns directly with an audit log in activity history. Prepared for automated Round-Robin and Workload balancing in future releases.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={!isAdmin || isSubmitting || salespeople.length === 0 || !selectedSalespersonId}
            isLoading={isSubmitting}
            leftIcon={isReassign ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
          >
            {isReassign ? 'Confirm Reassignment' : 'Save Assignment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
