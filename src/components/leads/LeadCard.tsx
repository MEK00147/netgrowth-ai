import React from 'react';
import { Lead } from '../../types/database';
import { StatusBadge, ClassificationBadge } from '../ui/Badge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { Building2, ChevronRight, Mail, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';

interface LeadCardProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onSelect }) => {
  return (
    <Card
      onClick={() => onSelect(lead)}
      hoverable
      className="p-4 cursor-pointer relative"
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
            {lead.first_name} {lead.last_name ?? ''}
          </h4>
          {lead.company_name && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{lead.company_name}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={lead.status} />
          <ClassificationBadge classification={lead.classification} score={lead.score} />
        </div>
      </div>

      <div className="space-y-1 text-xs text-slate-500 my-2">
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.budget && (
          <div className="text-xs font-medium text-slate-700">
            Budget: {formatCurrency(lead.budget, lead.budget_currency)}
          </div>
        )}
      </div>

      <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(lead.created_at)}</span>
        </span>
        <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Card>
  );
};
