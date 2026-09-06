import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { LeadStatus, LeadClassification } from '../../types/database';
import { LeadFilterOptions } from '../../services/leadService';

interface LeadFilterBarProps {
  filters: LeadFilterOptions;
  onChangeFilters: (filters: LeadFilterOptions) => void;
  totalResults: number;
}

export const LeadFilterBar: React.FC<LeadFilterBarProps> = ({
  filters,
  onChangeFilters,
  totalResults,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs mb-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search leads by name, email, company, inquiry..."
            value={filters.search ?? ''}
            onChange={(e) => onChangeFilters({ ...filters, search: e.target.value })}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5">
          <div className="w-full sm:w-36">
            <Select
              value={filters.classification ?? 'all'}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  classification: e.target.value as LeadClassification | 'all',
                })
              }
              className="py-1.5 text-xs"
            >
              <option value="all">All Classification</option>
              <option value="hot">🔥 Hot Leads</option>
              <option value="warm">⚡ Warm Leads</option>
              <option value="cold">❄️ Cold Leads</option>
            </Select>
          </div>

          <div className="w-full sm:w-36">
            <Select
              value={filters.status ?? 'all'}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  status: e.target.value as LeadStatus | 'all',
                })
              }
              className="py-1.5 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="qualified">Qualified</option>
              <option value="contacted">Contacted</option>
              <option value="meeting_scheduled">Meeting Scheduled</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </Select>
          </div>

          <div className="w-full sm:w-40 col-span-2 sm:col-span-1">
            <Select
              value={filters.sortBy ?? 'created_at_desc'}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  sortBy: e.target.value as any,
                })
              }
              className="py-1.5 text-xs"
            >
              <option value="created_at_desc">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="score_desc">Highest Score</option>
              <option value="score_asc">Lowest Score</option>
              <option value="company_asc">Company Name</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'lead' : 'leads'}
        </span>
        {(filters.search || filters.status !== 'all' || filters.classification !== 'all') && (
          <button
            onClick={() =>
              onChangeFilters({
                search: '',
                status: 'all',
                classification: 'all',
                sortBy: 'created_at_desc',
              })
            }
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};
