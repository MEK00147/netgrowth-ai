import React from 'react';
import { Lead } from '../../types/database';
import { StatusBadge, ClassificationBadge } from '../ui/Badge';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { ArrowRight, Building2, ChevronRight, Users } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

interface RecentLeadsListProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onViewAllLeads: () => void;
}

export const RecentLeadsList: React.FC<RecentLeadsListProps> = ({
  leads,
  onSelectLead,
  onViewAllLeads,
}) => {
  if (leads.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No leads yet"
        description="Inbound leads from contact forms and sales campaigns will populate here once received."
      />
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {leads.slice(0, 5).map((lead) => (
        <div
          key={lead.id}
          onClick={() => onSelectLead(lead)}
          className="p-4 sm:p-5 hover:bg-slate-50/80 transition duration-150 flex items-center justify-between gap-4 cursor-pointer group"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                {lead.first_name} {lead.last_name ?? ''}
              </span>
              <ClassificationBadge classification={lead.classification} score={lead.score} />
              <StatusBadge status={lead.status} />
            </div>

            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              {lead.company_name && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.company_name}</span>
                </span>
              )}
              <span>•</span>
              <span>{lead.email}</span>
              {lead.budget && (
                <>
                  <span>•</span>
                  <span>{formatCurrency(lead.budget, lead.budget_currency)}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400 hidden sm:inline">
              {formatRelativeTime(lead.created_at)}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
          </div>
        </div>
      ))}

      {leads.length > 5 && (
        <div className="p-3.5 text-center bg-slate-50/50">
          <button
            onClick={onViewAllLeads}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View all {leads.length} leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
