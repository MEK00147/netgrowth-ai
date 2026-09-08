import React, { useEffect, useState, useCallback } from 'react';
import { Lead, Activity, FollowUp, LeadStatus, CreateFollowUpInput, OrganizationMember } from '../types/database';
import { leadService } from '../services/leadService';
import { activityService } from '../services/activityService';
import { followUpService } from '../services/followUpService';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { StatusBadge, ClassificationBadge } from '../components/ui/Badge';
import { formatCurrency, formatDate, formatDateTime, formatRelativeTime } from '../utils/formatters';
import { ScheduleFollowUpModal } from '../components/leads/ScheduleFollowUpModal';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import { organizationService } from '../services/organizationService';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Calendar,
  Clock,
  Sparkles,
  Bot,
  CalendarPlus,
  Trash2,
  CheckCircle2,
  Tag,
  Share2,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

interface LeadDetailsProps {
  leadId: string;
  onBack: () => void;
  onLeadDeleted?: () => void;
}

export const LeadDetails: React.FC<LeadDetailsProps> = ({ leadId, onBack, onLeadDeleted }) => {
  const { user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [salesMembers, setSalesMembers] = useState<OrganizationMember[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [leadRes, actsRes, fupsRes] = await Promise.all([
        leadService.getLead(leadId),
        activityService.getLeadActivities(leadId),
        followUpService.getFollowUps(leadId),
      ]);

      if (leadRes.error) throw new Error(leadRes.error);
      if (actsRes.error) throw new Error(actsRes.error);
      if (fupsRes.error) throw new Error(fupsRes.error);

      setLead(leadRes.data);
      if (user?.profile?.role === 'admin' && user.profile.organization_id) {
        const members = await organizationService.getMembers(user.profile.organization_id);
        if (!members.error) setSalesMembers(members.data.filter((member) => member.role === 'sales'));
      }
      setActivities(actsRes.data);
      setFollowUps(fupsRes.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve lead data';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [leadId, user?.profile?.organization_id, user?.profile?.role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    setIsUpdatingStatus(true);
    try {
      const { data, error: err } = await leadService.updateLead(lead.id, { status: newStatus });
      if (err) throw new Error(err);
      if (data) {
        setLead(data);
        // Refresh activities to show new status_changed event
        const acts = await activityService.getLeadActivities(lead.id);
        setActivities(acts.data);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update lead status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCreateFollowUp = async (input: CreateFollowUpInput): Promise<boolean> => {
    try {
      const { data, error: err } = await followUpService.createFollowUp(input);
      if (err) throw new Error(err);
      if (data) {
        loadData();
        return true;
      }
      return false;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to schedule follow-up');
      return false;
    }
  };

  const handleDeleteLead = async () => {
    if (!lead) return;
    setIsDeleting(true);
    try {
      const { success, error: err } = await leadService.deleteLead(lead.id);
      if (!success && err) throw new Error(err);
      if (onLeadDeleted) onLeadDeleted();
      onBack();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete lead');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleFollowUp = async (fup: FollowUp) => {
    const newStatus = fup.status === 'completed' ? 'scheduled' : 'completed';
    await followUpService.updateFollowUp(fup.id, { status: newStatus });
    loadData();
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading lead record...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-semibold text-slate-900">Lead not found</h3>
        <p className="text-xs text-slate-500 mt-1">This lead record may have been deleted or does not exist.</p>
        <Button size="sm" variant="outline" onClick={onBack} className="mt-4">
          Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
            aria-label="Back to leads list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {lead.first_name} {lead.last_name ?? ''}
              </h2>
              <ClassificationBadge classification={lead.classification} score={lead.score} />
              <StatusBadge status={lead.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Added {formatDate(lead.created_at)} • Source: {lead.source || 'Direct'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<CalendarPlus className="w-3.5 h-3.5 text-indigo-600" />}
            onClick={() => setIsFollowUpModalOpen(true)}
          >
            Schedule Touchpoint
          </Button>

          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}

      {/* Delete Confirmation Alert if triggered */}
      {showDeleteConfirm && (
        <Alert
          type="warning"
          title="Confirm Lead Deletion"
          message={`Are you sure you want to permanently delete ${lead.first_name} ${lead.last_name ?? ''}? This will also delete all associated activities and follow-ups. This action cannot be undone.`}
          action={
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" variant="danger" isLoading={isDeleting} onClick={handleDeleteLead}>
                Yes, Delete Lead
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          }
        />
      )}

      {/* Quick Status Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Tag className="w-4 h-4 text-indigo-600" />
          <span>Pipeline Stage Transition:</span>
        </div>
        <div className="w-full sm:w-60">
          <Select
            value={lead.status}
            disabled={isUpdatingStatus}
            onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
            className="py-1.5 text-xs font-medium"
          >
            <option value="new">New Inquiry</option>
            <option value="qualified">Qualified</option>
            <option value="contacted">Contacted</option>
            <option value="meeting_scheduled">Meeting Scheduled</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="won">Closed Won</option>
            <option value="lost">Closed Lost</option>
          </Select>
        </div>
        {user?.profile?.role === 'admin' && salesMembers.length > 0 && (
          <div className="w-full sm:w-60">
            <Select value={lead.assigned_to ?? ''} onChange={async (e) => {
              const result = await leadService.updateLead(lead.id, { assigned_to: e.target.value || null });
              if (result.data) setLead(result.data);
              if (result.error) setError(result.error);
            }} className="py-1.5 text-xs font-medium">
              <option value="">Unassigned</option>
              {salesMembers.map((member) => <option key={member.user_id} value={member.user_id}>{member.full_name || member.email}</option>)}
            </Select>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lead Information & Inquiry (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inquiry Content */}
          <Card>
            <CardHeader
              title="Prospect Inquiry & Requirements"
              subtitle="Submitted requirement details from the prospect"
            />
            <CardBody className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {lead.inquiry}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Estimated Budget
                  </span>
                  <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                    {formatCurrency(lead.budget, lead.budget_currency)}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Target Timeline
                  </span>
                  <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                    {lead.timeline || 'Unspecified'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Acquisition Source
                  </span>
                  <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                    {lead.source || 'Direct Contact'}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* AI Intelligence Card (Phase 1: Displays explicit professional pending states) */}
          <Card className="border-indigo-100 bg-linear-to-b from-indigo-50/30 to-white">
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <span>AI Lead Intelligence & Qualification (Phase 1)</span>
                </div>
              }
              subtitle="Automated semantic analysis, scoring models, and recommended actions"
              action={
                <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                  Ready for Phase 2 n8n Pipeline
                </span>
              }
            />
            <CardBody className="space-y-4">
              {/* Score breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">AI Qualification Score</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-slate-900">
                      {lead.score !== null ? `${lead.score}/100` : 'AI analysis pending'}
                    </span>
                    {lead.classification && (
                      <span className="text-xs font-semibold capitalize text-slate-600">
                        ({lead.classification} Tier)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Calculated from budget fit, decision maker authority, and project urgency.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Recommended Sales Action</div>
                  <div className="text-xs font-medium text-slate-700 mt-1">
                    {lead.ai_recommended_action || 'AI analysis pending — Scheduled for Phase 2 automation.'}
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                <div className="text-xs font-semibold text-slate-700 mb-1">Executive Inquiry Summary</div>
                <p className="text-xs text-slate-600 italic">
                  {lead.ai_summary || 'AI analysis pending. Once n8n webhook and qualification engine are connected in Phase 2, an executive synthesis will appear here.'}
                </p>
              </div>

              {/* Buying signals & pain points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <div className="text-xs font-semibold text-emerald-800 mb-1">Detected Buying Signals</div>
                  <p className="text-xs text-slate-500 italic">AI analysis pending</p>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <div className="text-xs font-semibold text-rose-800 mb-1">Customer Pain Points</div>
                  <p className="text-xs text-slate-500 italic">AI analysis pending</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader
              title="Audit Trail & Activity Timeline"
              subtitle="Chronological log of lead events, status changes, and future webhook events"
            />
            <CardBody>
              {activities.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No activity recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activities.map((act) => (
                    <div key={act.id} className="relative group">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                      <div className="text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900">{act.description}</span>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {formatRelativeTime(act.created_at)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          Event: {act.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Contact info & Follow-ups (1 col) */}
        <div className="space-y-6">
          {/* Contact Details Card */}
          <Card>
            <CardHeader title="Contact & Organization" />
            <CardBody className="space-y-3.5 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Email
                </span>
                <a
                  href={`mailto:${lead.email}`}
                  className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 mt-0.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{lead.email}</span>
                </a>
              </div>

              {lead.phone && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Phone
                  </span>
                  <a
                    href={`tel:${lead.phone}`}
                    className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.phone}</span>
                  </a>
                </div>
              )}

              {lead.company_name && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Company
                  </span>
                  <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.company_name}</span>
                  </span>
                </div>
              )}

              {lead.job_title && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Job Title / Role
                  </span>
                  <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.job_title}</span>
                  </span>
                </div>
              )}

              {lead.industry && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Industry
                  </span>
                  <span className="font-medium text-slate-800 block mt-0.5">{lead.industry}</span>
                </div>
              )}

              {lead.website && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Website
                  </span>
                  <a
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-indigo-600 hover:underline flex items-center gap-1.5 mt-0.5 truncate"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="truncate">{lead.website}</span>
                  </a>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Scheduled Follow-ups for this lead */}
          <Card>
            <CardHeader
              title="Scheduled Touchpoints"
              subtitle="Tasks & calls for this prospect"
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
                  onClick={() => setIsFollowUpModalOpen(true)}
                >
                  Schedule
                </Button>
              }
            />
            <CardBody className="p-0">
              {followUps.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-400">
                  No follow-ups scheduled for this lead.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {followUps.map((fup) => (
                    <div key={fup.id} className="p-3.5 text-xs flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="capitalize font-semibold text-slate-800">
                            {fup.channel}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              fup.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {fup.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {formatDateTime(fup.scheduled_for)}
                        </div>
                        {fup.notes && <p className="text-slate-600 mt-1 text-xs">{fup.notes}</p>}
                      </div>
                      <button
                        onClick={() => handleToggleFollowUp(fup)}
                        className={`p-1.5 rounded-md border text-xs cursor-pointer transition ${
                          fup.status === 'completed'
                            ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                            : 'border-slate-300 text-slate-500 hover:border-indigo-500'
                        }`}
                        title={fup.status === 'completed' ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Schedule Follow Up Modal */}
      <ScheduleFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        leadId={lead.id}
        leadName={`${lead.first_name} ${lead.last_name ?? ''}`}
        onSubmit={handleCreateFollowUp}
      />
    </div>
  );
};
