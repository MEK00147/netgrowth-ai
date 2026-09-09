import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Copy, Check, Database, ShieldCheck, KeyRound, Building2 } from 'lucide-react';
import { MULTI_TENANT_SCHEMA_SQL } from '../../constants/schemaSql';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(MULTI_TENANT_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Multi-Tenant PostgreSQL Schema & RLS Architecture"
      description="Database tables, organization tenancy, manual assignment constraints, and Row Level Security (RLS) policies."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Environment setup instructions */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-700 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Multi-Tenant Access Control in Supabase</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Run this SQL in your <strong>Supabase Dashboard &rarr; SQL Editor</strong> to create the multi-tenant database tables (<code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">organizations</code>, <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">organization_members</code>, <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">leads</code>, <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">activities</code>, <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">follow_ups</code>) and enable strict Row Level Security policies.
          </p>
          <div className="flex items-center gap-2 text-emerald-700 font-medium pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Database-enforced: Admins manage all organization leads; Sales users only access assigned leads.</span>
          </div>
        </div>

        {/* SQL Preview Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>supabase/schema.sql</span>
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={copyToClipboard}
            >
              <span>{copied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
            </Button>
          </div>
          <div className="relative">
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto max-h-72 border border-slate-800">
              <code>{MULTI_TENANT_SCHEMA_SQL}</code>
            </pre>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
