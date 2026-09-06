import React from 'react';
import { FollowUp } from '../../types/database';
import { formatDateTime } from '../../utils/formatters';
import { CalendarClock, Check, Mail, Phone, MessageSquare, Smartphone, Calendar, Clock } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

interface UpcomingFollowUpsListProps {
  followUps: FollowUp[];
  onToggleComplete?: (followUp: FollowUp) => void;
  onSelectLeadById?: (leadId: string) => void;
}

export const UpcomingFollowUpsList: React.FC<UpcomingFollowUpsListProps> = ({
  followUps,
  onToggleComplete,
  onSelectLeadById,
}) => {
  if (followUps.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No follow-ups scheduled"
        description="Schedule sales tasks, follow-up calls, or emails directly on any lead profile."
      />
    );
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-blue-600" />;
      case 'phone':
        return <Phone className="w-3.5 h-3.5 text-emerald-600" />;
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-teal-600" />;
      case 'sms':
        return <Smartphone className="w-3.5 h-3.5 text-purple-600" />;
      case 'meeting':
        return <Calendar className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="divide-y divide-slate-100">
      {followUps.slice(0, 5).map((fup) => {
        const isCompleted = fup.status === 'completed';
        const isOverdue = !isCompleted && new Date(fup.scheduled_for).getTime() < Date.now();

        return (
          <div
            key={fup.id}
            className={`p-4 hover:bg-slate-50/80 transition duration-150 flex items-start justify-between gap-3 ${
              isCompleted ? 'opacity-60 bg-slate-50/40' : ''
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              {/* Checkbox button */}
              <button
                type="button"
                onClick={() => onToggleComplete && onToggleComplete(fup)}
                className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 hover:border-indigo-500 text-transparent hover:text-slate-300'
                }`}
                title={isCompleted ? 'Mark as scheduled' : 'Mark as completed'}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-1 rounded bg-slate-100 border border-slate-200 shrink-0">
                    {getChannelIcon(fup.channel)}
                  </span>
                  <span
                    onClick={() => onSelectLeadById && onSelectLeadById(fup.lead_id)}
                    className="text-xs font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer truncate"
                  >
                    {fup.lead
                      ? `${fup.lead.first_name} ${fup.lead.last_name ?? ''} (${fup.lead.company_name || fup.lead.email})`
                      : 'Lead Task'}
                  </span>
                </div>

                {fup.notes && (
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">{fup.notes}</p>
                )}

                <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                  <span
                    className={`font-medium ${
                      isOverdue
                        ? 'text-rose-600 font-semibold'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {isOverdue && !isCompleted ? 'Overdue • ' : ''}
                    {formatDateTime(fup.scheduled_for)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="capitalize text-slate-500">{fup.channel}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
