import React, { useEffect, useState, useCallback } from 'react';
import { Lead } from '../types/database';
import { leadService, LeadFilterOptions } from '../services/leadService';
import { LeadFilterBar } from '../components/leads/LeadFilterBar';
import { LeadTableRow } from '../components/leads/LeadTableRow';
import { LeadCard } from '../components/leads/LeadCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { Skeleton } from '../components/ui/Skeleton';
import { Plus, Users, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LeadsProps {
  onSelectLead: (lead: Lead) => void;
  onOpenNewLeadModal: () => void;
}

export const Leads: React.FC<LeadsProps> = ({ onSelectLead, onOpenNewLeadModal }) => {
  const { isDemoMode } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<LeadFilterOptions>({
    status: 'all',
    classification: 'all',
    search: '',
    sortBy: 'created_at_desc',
  });

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await leadService.getLeads(filters);
      if (err) throw new Error(err);
      setLeads(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch leads';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads, isDemoMode]);

  return (
    <div className="space-y-5">
      {/* Header with Title and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lead Pipeline Management</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor, qualify, and triage prospect inquiries across your sales channels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadLeads}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onOpenNewLeadModal}
          >
            Add New Lead
          </Button>
        </div>
      </div>

      {error && <Alert type="error" title="Could not load leads" message={error} />}

      {/* Filter and Search Bar */}
      <LeadFilterBar
        filters={filters}
        onChangeFilters={(newFilters) => setFilters(newFilters)}
        totalResults={leads.length}
      />

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-3">
          <Skeleton className="h-6 w-1/3 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6">
          <EmptyState
            icon={Users}
            title="No leads found"
            description={
              filters.search || filters.status !== 'all' || filters.classification !== 'all'
                ? 'No leads matched your filter criteria. Try clearing or relaxing search filters.'
                : 'Your sales pipeline currently has no registered leads. Create a new lead to get started.'
            }
            action={
              <Button size="sm" variant="secondary" onClick={onOpenNewLeadModal}>
                Create Lead
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Contact Name</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Date Added</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <LeadTableRow key={lead.id} lead={lead} onSelect={onSelectLead} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Responsive Card Grid View (Visible on mobile screens) */}
          <div className="md:hidden space-y-3">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onSelect={onSelectLead} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
