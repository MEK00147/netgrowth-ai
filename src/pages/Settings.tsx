import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { demoStore } from '../lib/demoData';
import {
  User,
  Building2,
  Mail,
  ShieldCheck,
  Database,
  Sparkles,
  KeyRound,
  RotateCcw,
  Check,
} from 'lucide-react';

interface SettingsProps {
  onOpenSchemaModal: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onOpenSchemaModal }) => {
  const { user, updateProfile, isConfigured, isDemoMode, toggleDemoMode } = useAuth();
  const [fullName, setFullName] = useState(user?.profile?.full_name || '');
  const [companyName, setCompanyName] = useState(user?.profile?.company_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.profile) {
      setFullName(user.profile.full_name || '');
      setCompanyName(user.profile.company_name || '');
    }
  }, [user]);

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
      text: 'Demo dataset reset to initial presentation benchmark data.',
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
          Manage your organization profile, Supabase connection status, and demo sandbox data.
        </p>
      </div>

      {statusMessage && (
        <Alert
          type={statusMessage.type}
          message={statusMessage.text}
          onClose={() => setStatusMessage(null)}
        />
      )}

      {/* Profile Form */}
      <Card>
        <CardHeader
          title="Executive Profile"
          subtitle="User profile and organization metadata linked to your Supabase credentials"
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
                placeholder="Apex Automation Ltd"
                leftIcon={<Building2 className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Registered Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email is managed via your Supabase Auth user identity."
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="User UUID (Owner ID)"
                value={user?.id || ''}
                disabled
                helperText="Enforces PostgreSQL Row Level Security (RLS) policies."
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
          title="Database & Security Status"
          subtitle="PostgreSQL Row Level Security (RLS) enforcement and connection status"
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
                    ? 'Row Level Security is actively enforcing organization membership, admin access, and assigned-lead access in PostgreSQL.'
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
                All tables (`profiles`, `leads`, `activities`, `follow_ups`) enforce tenant boundaries at the database level.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-600" />
                <span>Migration Script</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                The full SQL script is stored in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">supabase/schema.sql</code> including triggers and performance indexes.
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
