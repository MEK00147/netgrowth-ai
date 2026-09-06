import React, { useEffect, useState, useCallback } from 'react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { RecentLeadsList } from '../components/dashboard/RecentLeadsList';
import { UpcomingFollowUpsList } from '../components/dashboard/UpcomingFollowUpsList';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { leadService } from '../services/leadService';
import { followUpService } from '../services/followUpService';
import { Lead, FollowUp, DashboardMetrics } from '../types/database';
import {
  Users,
  Flame,
  Zap,
  Snowflake,
  Sparkles,
  Award,
  Plus,
  ArrowUpRight,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  onSelectLead: (lead: Lead) => void;
  onNavigateToLeads: () => void;
  onOpenNewLeadModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectLead,
  onNavigateToLeads,
  onOpenNewLeadModal,
}) => {
  const { user, isDemoMode } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [metricsRes, leadsRes, followUpsRes] = await Promise.all([
        leadService.getDashboardMetrics(),
        leadService.getLeads({ sortBy: 'created_at_desc' }),
        followUpService.getFollowUps(undefined, 'scheduled'),
      ]);

      if (metricsRes.error) throw new Error(metricsRes.error);
      if (leadsRes.error) throw new Error(leadsRes.error);
      if (followUpsRes.error) throw new Error(followUpsRes.error);

      setMetrics(metricsRes.metrics);
      setRecentLeads(leadsRes.data);
      setFollowUps(followUpsRes.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, isDemoMode]);

  const handleToggleFollowUp = async (followUp: FollowUp) => {
    const newStatus = followUp.status === 'completed' ? 'scheduled' : 'completed';
    await followUpService.updateFollowUp(followUp.id, { status: newStatus });
    loadDashboardData();
  };

  const handleSelectLeadById = async (leadId: string) => {
    const { data } = await leadService.getLead(leadId);
    if (data) {
      onSelectLead(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Welcome, {user?.profile?.full_name || 'Executive'}
            </h2>
            {isDemoMode && (
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {user?.profile?.company_name ? `${user.profile.company_name} — ` : ''}
            Lead intake, automated qualification metrics, and sales pipeline readiness.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadDashboardData}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onOpenNewLeadModal}
          >
            Add Inbound Lead
          </Button>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          title="Data synchronization issue"
          message={error}
          action={
            <Button size="sm" variant="outline" onClick={loadDashboardData}>
              Retry
            </Button>
          }
        />
      )}

      {/* Metrics Row */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <MetricCard
            title="Total Leads"
            value={metrics?.totalLeads ?? 0}
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-700"
          />

          <MetricCard
            title="Hot Leads"
            value={metrics?.hotLeads ?? 0}
            subtitle="Score 80-100"
            icon={Flame}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            highlight={Boolean(metrics?.hotLeads && metrics.hotLeads > 0)}
          />

          <MetricCard
            title="Warm Leads"
            value={metrics?.warmLeads ?? 0}
            subtitle="Score 50-79"
            icon={Zap}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />

          <MetricCard
            title="Cold Leads"
            value={metrics?.coldLeads ?? 0}
            subtitle="Score 0-49"
            icon={Snowflake}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
          />

          <MetricCard
            title="New / Uncontacted"
            value={metrics?.newLeads ?? 0}
            icon={Sparkles}
            iconBg="bg-purple-50"
            iconColor="text-purple-700"
          />

          <MetricCard
            title="Avg Lead Score"
            value={metrics?.averageScore !== null ? `${metrics?.averageScore}` : '—'}
            subtitle="Max 100"
            icon={Award}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-700"
          />
        </div>
      )}

      {/* Main Grid: Recent Leads & Upcoming Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inbound Leads (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader
              title="Recent Inbound Inquiries"
              subtitle="Latest prospective leads captured from inbound channels"
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  onClick={onNavigateToLeads}
                >
                  Manage All Leads
                </Button>
              }
            />
            {isLoading ? (
              <div className="p-5 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <RecentLeadsList
                leads={recentLeads}
                onSelectLead={onSelectLead}
                onViewAllLeads={onNavigateToLeads}
              />
            )}
          </Card>
        </div>

        {/* Scheduled Follow-ups (1 col) */}
        <div>
          <Card className="overflow-hidden h-full flex flex-col">
            <CardHeader
              title="Upcoming Touchpoints"
              subtitle="Pending follow-ups & sales calls"
            />
            <div className="flex-1">
              {isLoading ? (
                <div className="p-5 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <UpcomingFollowUpsList
                  followUps={followUps}
                  onToggleComplete={handleToggleFollowUp}
                  onSelectLeadById={handleSelectLeadById}
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Phase 2 Architecture Readiness Callout */}
      <div className="p-5 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs text-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-indigo-900 text-sm">
              Automation & Qualification Architecture Ready
            </h4>
            <p className="text-slate-600 text-xs mt-0.5 max-w-2xl leading-relaxed">
              Phase 1 foundation establishes the typed database schema, Row Level Security, and lead lifecycle. In Phase 2, incoming webhook events will trigger n8n workflows and AI scoring models to enrich inquiries automatically.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-2xs">
            Phase 1 Active
          </span>
        </div>
      </div>
    </div>
  );
};
