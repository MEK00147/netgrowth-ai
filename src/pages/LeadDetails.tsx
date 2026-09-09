import React, { useEffect, useState, useCallback } from 'react';
import { Lead, Activity, FollowUp, LeadStatus, CreateFollowUpInput } from '../types/database';
import { leadService } from '../services/leadService';
import { activityService } from '../services/activityService';
import { followUpService } from '../services/followUpService';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { StatusBadge, ClassificationBadge } from '../components/ui/Badge';
import { formatCurrency, formatDate, formatDateTime, formatRelativeTime } from '../utils/formatters';
import { ScheduleFollowUpModal } from '../components/leads/ScheduleFollowUpModal';
import { AssignLeadModal } from '../components/leads/AssignLeadModal';
import { AddActivityModal } from '../components/leads/AddActivityModal';
import { Alert } from '../components/ui/Alert';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Bot,
  CalendarPlus,
  Trash2,
  CheckCircle2,
  Tag,
  UserCheck,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  MessageSquarePlus,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';

interface LeadDetailsProps {
  leadId: string;
  onBack: () => void;
  onLeadDeleted?: () => void;
}

export const LeadDetails: React.FC<LeadDetailsProps> = ({ leadId, onBack, onLeadDeleted }) => {
  const { user, isAdmin, isSales } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccessDenied, setIsAccessDenied] = useState<boolean>(false);

  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsAccessDenied(false);
    try {
      const [leadRes, actsRes, fupsRes] = await Promise.all([
        leadService.getLead(leadId),
        activityService.getLeadActivities(leadId),
        followUpService.getFollowUps(leadId),
      ]);

      if (leadRes.error) {
        if (
          leadRes.error.toLowerCase().includes('access denied') ||
          leadRes.error.toLowerCase().includes('permission') ||
          leadRes.error.toLowerCase().includes('security')
        ) {
          setIsAccessDenied(true);
        }
        throw new Error(leadRes.error);
      }
      if (actsRes.error) throw new Error(actsRes.error);
      if (fupsRes.error) throw new Error(fupsRes.error);

      setLead(leadRes.data);
      setActivities(actsRes.data);
      setFollowUps(fupsRes.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve lead data';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

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
    if (!isAdmin) {
      setError('Permission denied: Only organization administrators can delete leads.');
      return;
    }
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

  const handleAssigned = (updatedLead: Lead) => {
    setLead(updatedLead);
    loadData(); // Re-fetch to update audit trail timeline
  };

  const handleActivityAdded = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Verifying authorization and loading lead record...</p>
      </div>
    );
  }

  // Security Access Denied State
  if (isAccessDenied || (!lead && error)) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center bg-white rounded-xl border border-rose-200 shadow-sm mt-8">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-200">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Security Access Denied</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          {error || 'You do not have permission to view this lead. Under organization access control rules, sales specialists can only access leads assigned directly to them.'}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button size="sm" variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to My Leads
          </Button>
        </div>
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

  const assignedName = lead.assigned_user?.full_name || (lead.assigned_to ? 'Sales Specialist' : null);
  const isAssignedToCurrentUser = Boolean(user && lead.assigned_to === user.id);

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
              <ClassificationBadge classification={lead.classification || lead.temperature} score={lead.score ?? lead.ai_score} />
              <StatusBadge status={lead.status} />

              {/* Assignee pill in header */}
              {assignedName ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  <UserCheck className="w-3 h-3 text-indigo-600" />
                  <span>Assigned to: <strong className="text-slate-900">{assignedName}</strong></span>
                  {isAssignedToCurrentUser && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">You</span>
                  )}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Unassigned</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Added {formatDate(lead.created_at)} • Source: {lead.source || 'Direct'}
              {lead.service_interest && ` • Interest: ${lead.service_interest}`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Admin Manual Assignment Button */}
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="border-indigo-200 bg-indigo-50/40 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
              leftIcon={lead.assigned_to ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              onClick={() => setIsAssignModalOpen(true)}
            >
              {lead.assigned_to ? 'Reassign Lead' : 'Assign to Sales'}
            </Button>
          )}

          {/* Add Activity / Note Button (both Admin and Sales) */}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<MessageSquarePlus className="w-3.5 h-3.5 text-slate-600" />}
            onClick={() => setIsAddActivityOpen(true)}
          >
            Add Note
          </Button>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<CalendarPlus className="w-3.5 h-3.5 text-indigo-600" />}
            onClick={() => setIsFollowUpModalOpen(true)}
          >
            Schedule Touchpoint
          </Button>

          {/* Delete Button (Admins only) */}
          {isAdmin && (
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          )}
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

          {/* AI Intelligence Card */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">AI Qualification Score</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-slate-900">
                      {(lead.score ?? lead.ai_score) !== null && (lead.score ?? lead.ai_score) !== undefined
                        ? `${lead.score ?? lead.ai_score}/100`
                        : 'AI analysis pending'}
                    </span>
                    {(lead.classification || lead.temperature) && (
                      <span className="text-xs font-semibold capitalize text-slate-600">
                        ({lead.classification || lead.temperature} Tier)
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

              <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                <div className="text-xs font-semibold text-slate-700 mb-1">Executive Inquiry Summary</div>
                <p className="text-xs text-slate-600 italic">
                  {lead.ai_summary || 'AI analysis pending. Once n8n webhook and qualification engine are connected in Phase 2, an executive synthesis will appear here.'}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader
              title="Audit Trail & Activity Timeline"
              subtitle="Chronological log of lead events, assignment changes, and sales notes"
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<MessageSquarePlus className="w-3.5 h-3.5 text-indigo-600" />}
                  onClick={() => setIsAddActivityOpen(true)}
                >
                  Log Activity
                </Button>
              }
            />
            <CardBody>
              {activities.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No activity recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activities.map((act) => {
                    const isAssignmentEvent = act.type === 'lead_assigned' || act.type === 'lead_reassigned';
                    return (
                      <div key={act.id} className="relative group">
                        <div
                          className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                            isAssignmentEvent ? 'bg-indigo-600' : 'bg-slate-400'
                          }`}
                        />
                        <div className="text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">{act.description}</span>
                            <span className="text-[11px] text-slate-400 shrink-0">
                              {formatRelativeTime(act.created_at)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-mono flex items-center gap-2">
                            <span>Event: {act.type}</span>
                            {act.user_name && <span>• By: {act.user_name}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Assignment, Contact info & Follow-ups (1 col) */}
        <div className="space-y-6">
          {/* Salesperson Assignment Card */}
          <Card>
            <CardHeader
              title="Sales Ownership & Assignment"
              subtitle="Designated representative for this lead"
              action={
                isAdmin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                    onClick={() => setIsAssignModalOpen(true)}
                  >
                    {lead.assigned_to ? 'Change' : 'Assign'}
                  </Button>
                )
              }
            />
            <CardBody className="space-y-3">
              {lead.assigned_user || lead.assigned_to ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {(lead.assigned_user?.full_name || 'S').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate flex items-center gap-1.5">
                        <span>{lead.assigned_user?.full_name || 'Assigned Representative'}</span>
                        {isAssignedToCurrentUser && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">You</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {lead.assigned_user?.email || 'Sales Specialist'}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase shrink-0">
                    Sales
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>No salesperson currently assigned</span>
                  </div>
                  {isAdmin ? (
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full text-xs"
                      leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                      onClick={() => setIsAssignModalOpen(true)}
                    >
                      Assign to Salesperson
                    </Button>
                  ) : (
                    <p className="text-[11px] text-amber-700">
                      Lead is awaiting review and manual assignment by an organization administrator.
                    </p>
                  )}
                </div>
              )}

              {/* Role-based permissions notice */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {isAdmin
                    ? 'Admin privilege: You can assign or reassign leads across your team.'
                    : 'Sales privilege: You have edit and follow-up access to this assigned lead.'}
                </span>
              </div>
            </CardBody>
          </Card>

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

              {lead.service_interest && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Service Interest
                  </span>
                  <span className="font-medium text-slate-800 block mt-0.5">{lead.service_interest}</span>
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

      {/* Modals */}
      <ScheduleFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        leadId={lead.id}
        leadName={`${lead.first_name} ${lead.last_name ?? ''}`}
        onSubmit={handleCreateFollowUp}
      />

      {isAdmin && (
        <AssignLeadModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          lead={lead}
          onAssigned={handleAssigned}
        />
      )}

      <AddActivityModal
        isOpen={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
        leadId={lead.id}
        leadName={`${lead.first_name} ${lead.last_name ?? ''}`}
        onActivityAdded={handleActivityAdded}
      />
    </div>
  );
};
