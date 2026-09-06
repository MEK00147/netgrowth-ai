import React from 'react';
import { Lead } from '../../types/database';
import { StatusBadge, ClassificationBadge } from '../ui/Badge';
import { formatDate } from '../../utils/formatters';
import { ChevronRight, Building2, Globe } from 'lucide-react';

interface LeadTableRowProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
}

export const LeadTableRow: React.FC<LeadTableRowProps> = ({ lead, onSelect }) => {
  return (
    <tr
      onClick={() => onSelect(lead)}
      className="hover:bg-slate-50/90 transition duration-150 cursor-pointer group text-xs text-slate-700"
    >
      {/* Name */}
      <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-indigo-600 transition">
        <div className="flex items-center gap-2">
          <span>
            {lead.first_name} {lead.last_name ?? ''}
          </span>
          {lead.job_title && (
            <span className="text-[11px] text-slate-400 font-normal hidden xl:inline">
              ({lead.job_title})
            </span>
          )}
        </div>
      </td>

      {/* Company */}
      <td className="py-3.5 px-4">
        {lead.company_name ? (
          <div className="flex items-center gap-1.5 text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[140px]">{lead.company_name}</span>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      {/* Email */}
      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[160px]">
        {lead.email}
      </td>

      {/* Score */}
      <td className="py-3.5 px-4 font-mono font-medium">
        {typeof lead.score === 'number' ? (
          <span className={lead.score >= 80 ? 'text-rose-600 font-bold' : lead.score >= 50 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
            {lead.score}
          </span>
        ) : (
          <span className="text-slate-400 italic font-sans text-[11px]">Pending</span>
        )}
      </td>

      {/* Classification */}
      <td className="py-3.5 px-4">
        <ClassificationBadge classification={lead.classification} />
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <StatusBadge status={lead.status} />
      </td>

      {/* Source */}
      <td className="py-3.5 px-4 text-slate-500 truncate max-w-[120px]">
        {lead.source || 'Direct'}
      </td>

      {/* Created Date */}
      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
        {formatDate(lead.created_at)}
      </td>

      {/* Action Arrow */}
      <td className="py-3.5 px-4 text-right">
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition inline-block" />
      </td>
    </tr>
  );
};
