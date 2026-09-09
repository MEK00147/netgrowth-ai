import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { demoStore } from '../lib/demoData';
import { organizationService } from '../services/organizationService';
import { OrganizationMember } from '../types/database';
import {
  User,
  Building2,
  Mail,
  ShieldCheck,
  Database,
  Sparkles,
  KeyRound,
  RotateCcw,
  Users,
  Shield,
  UserCheck,
} from 'lucide-react';

interface SettingsProps {
  onOpenSchemaModal: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onOpenSchemaModal }) => {
  const { user, organization, role, isAdmin, updateProfile, isConfigured, isDemoMode, toggleDemoMode } = useAuth();
  const [fullName, setFullName] = useState(user?.profile?.full_name || '');
  const [companyName, setCompanyName] = useState(user?.profile?.company_name || '');
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.profile) {
      setFullName(user.profile.full_name || '');
      setCompanyName(user.profile.company_name || '');
    }
  }, [user]);

  useEffect(() => {
    const loadMembers = async () => {
      if (organization) {
        const { data } = await organizationService.getOrganizationMembers(organization.id);
        if (data) setMembers(data);
      }
    };
    loadMembers();
  }, [organization, isDemoMode]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const result = await updateProfile({
      full_name: fullName.trim(),
      company_name: companyName.trim(),
    });

    setIsSaving(false);
    if (result.success) {
      setStatusMessage({ type: 'success', text: 'Organization profile updated successfully.' });
    } else {
      setStatusMessage({ type: 'error', text: result.error || 'Failed to update profile.' });
    }
  };

  const handleResetDemoData = () => {
    demoStore.resetDemoData();
    setStatusMessage({
      type: 'success',
      text: 'Demo dataset reset to initial benchmark state.',
    });
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System & Organization Settings</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your organization profile, team roles, Row Level Security, and demo sandbox data.
        </p>
      </div>

      {statusMessage && (
        <Alert
          type={statusMessage.type}
          message={statusMessage.text}
          onClose={() => setStatusMessage(null)}
        />
      )}

      {/* Organization & Team Role Context */}
      <Card>
        <CardHeader
          title="Organization & Access Control (Multi-Tenancy)"
          subtitle="Organization isolation parameters and assigned user permissions"
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Active Organization
              </span>
              <div className="font-semibold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>{organization?.name || 'NetGrowth Workspace'}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block truncate">
                ID: {organization?.id}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Your Role
              </span>
              <div className="font-semibold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                {isAdmin ? (
                  <Shield className="w-4 h-4 text-amber-600" />
                ) : (
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                )}
                <span className="capitalize">{role === 'sales' ? 'Sales Specialist' : 'Administrator'}</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {isAdmin
                  ? 'Can view all leads, assign/reassign to team, delete leads'
                  : 'Can only view and update assigned leads'}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Security Model
              </span>
              <div className="font-semibold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>PostgreSQL RLS</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Cross-tenant queries physically prevented at database layer
              </span>
            </div>
          </div>

          {/* Team Members List */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Organization Members ({members.length})</span>
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Team Member</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Assignable to Leads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {m.user?.full_name || 'Team Member'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {m.user?.email}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            m.role === 'admin'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {m.role === 'sales' ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            Eligible for manual assignment
                          </span>
                        ) : (
                          <span className="text-slate-400">Admin (Assigner)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader
          title="Executive Profile"
          subtitle="User profile metadata and display credentials"
        />
        <CardBody>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Company / Enterprise Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="NetGrowth Workspace"
                leftIcon={<Building2 className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Registered Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email is managed via Supabase Auth identity."
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="User ID (UUID)"
                value={user?.id || ''}
                disabled
                helperText="PostgreSQL Row Level Security (RLS) identity."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="secondary" isLoading={isSaving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Database & Security Architecture Panel */}
      <Card>
        <CardHeader
          title="Database & Security Architecture"
          subtitle="PostgreSQL multi-tenant schema with organizations and organization_members"
        />
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isConfigured ? <ShieldCheck className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  {isConfigured ? 'Supabase Backend Connected' : 'Demo Sandbox Active (Env Pending)'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isConfigured
                    ? 'Row Level Security is actively isolating lead data by organization_id in PostgreSQL.'
                    : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to persist to real Supabase database.'}
                </p>
              </div>
            </div>

            <Button size="sm" variant="outline" onClick={onOpenSchemaModal}>
              View Schema
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Multi-Tenant Row Level Security</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Organizations have isolated scopes. Admins can view all organization leads; sales specialists can only access leads where <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">assigned_to = auth.uid()</code>.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-600" />
                <span>Extensible Assignment Strategy</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                V1 implements manual assignment via <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">ManualAssignmentStrategy</code> with full audit logs. Ready for round-robin and AI workload routing in Phase 2.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Client Demo Sandbox Management */}
      <Card>
        <CardHeader
          title="Client Presentation Sandbox"
          subtitle="Manage isolated presentation datasets for client meetings and reviews"
        />
        <CardBody className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-amber-50/50 border border-amber-200 text-xs">
            <div>
              <h4 className="font-semibold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Demo Sandbox State</span>
              </h4>
              <p className="text-amber-800 mt-0.5">
                Current mode: <strong>{isDemoMode ? 'Demo Sandbox Active' : 'Live Mode'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isDemoMode ? 'outline' : 'secondary'}
                onClick={() => toggleDemoMode(!isDemoMode)}
              >
                {isDemoMode ? 'Switch to Live User Data' : 'Activate Demo Sandbox'}
              </Button>

              <Button
                size="sm"
                variant="outline"
                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
                onClick={handleResetDemoData}
              >
                Reset Demo Data
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
