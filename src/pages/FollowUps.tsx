import React, { useEffect, useState, useCallback } from 'react';
import { FollowUp, FollowUpStatus, FollowUpChannel, Lead } from '../types/database';
import { followUpService } from '../services/followUpService';
import { leadService } from '../services/leadService';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDateTime } from '../utils/formatters';
import {
  CalendarClock,
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
  Smartphone,
  Calendar,
  Clock,
  RefreshCw,
  Building2,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FollowUpsProps {
  onSelectLead: (lead: Lead) => void;
}

export const FollowUps: React.FC<FollowUpsProps> = ({ onSelectLead }) => {
  const { user, role, isDemoMode } = useAuth();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [statusFilter, setStatusFilter] = useState<FollowUpStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFollowUps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filter = statusFilter === 'all' ? undefined : statusFilter;
      const { data, error: err } = await followUpService.getFollowUps(undefined, filter);
      if (err) throw new Error(err);
      setFollowUps(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch follow-ups');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps, isDemoMode, user?.id, role]);

  const handleToggleComplete = async (fup: FollowUp) => {
    const newStatus = fup.status === 'completed' ? 'scheduled' : 'completed';
    await followUpService.updateFollowUp(fup.id, { status: newStatus });
    loadFollowUps();
  };

  const handleDelete = async (id: string) => {
    await followUpService.deleteFollowUp(id);
    loadFollowUps();
  };

  const handleLeadClick = async (leadId: string) => {
    const { data } = await leadService.getLead(leadId);
    if (data) {
      onSelectLead(data);
    }
  };

  const getChannelIcon = (channel: FollowUpChannel) => {
    switch (channel) {
      case 'phone':
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-teal-600" />;
      case 'sms':
        return <Smartphone className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Scheduled Follow-ups</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage scheduled customer touchpoints, discovery calls, and reminder tasks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadFollowUps}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert type="error" title="Error" message={error} />}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-600">Filter by Status:</span>
          <div className="w-44">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FollowUpStatus | 'all')}
              className="py-1.5 text-xs"
            >
              <option value="all">All Touchpoints</option>
              <option value="scheduled">Scheduled Only</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </Select>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong>{followUps.length}</strong> touchpoints
        </span>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : followUps.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6">
          <EmptyState
            icon={CalendarClock}
            title="No follow-ups scheduled"
            description="You have no tasks matching this filter. Schedule a touchpoint from any lead details page."
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {followUps.map((fup) => {
            const isCompleted = fup.status === 'completed';
            const isOverdue = !isCompleted && new Date(fup.scheduled_for).getTime() < Date.now();

            return (
              <div
                key={fup.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/80 transition duration-150 ${
                  isCompleted ? 'bg-slate-50/40 opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Toggle button */}
                  <button
                    onClick={() => handleToggleComplete(fup)}
                    className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center transition shrink-0 cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-indigo-600 text-transparent hover:text-slate-300'
                    }`}
                    title={isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="p-1 rounded bg-slate-100 border border-slate-200 shrink-0">
                        {getChannelIcon(fup.channel)}
                      </div>
                      <span className="text-xs font-semibold capitalize text-slate-900">
                        {fup.channel} Touchpoint
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Scheduled'}
                      </span>
                    </div>

                    {fup.notes && (
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{fup.notes}</p>
                    )}

                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDateTime(fup.scheduled_for)}</span>
                      </span>

                      {fup.lead && (
                        <button
                          onClick={() => handleLeadClick(fup.lead_id)}
                          className="flex items-center gap-1 text-indigo-600 hover:underline font-medium cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {fup.lead.first_name} {fup.lead.last_name ?? ''}
                            {fup.lead.company_name ? ` (${fup.lead.company_name})` : ''}
                          </span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(fup.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                    title="Delete touchpoint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
