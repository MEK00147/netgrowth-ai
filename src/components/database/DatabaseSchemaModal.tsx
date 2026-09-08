import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Copy, Check, Database, ShieldCheck, KeyRound } from 'lucide-react';
import sqlSchema from '../../../supabase/migrations/20260908120000_initial_secure_schema.sql?raw';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Database schema and access rules"
      description="The same versioned migration used for Supabase setup."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-700 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>Safe frontend configuration</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            The browser may use only the project URL and publishable key. Add them to <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">.env</code> after this migration has been applied.
          </p>
          <div className="bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-[11px] select-all">
            VITE_SUPABASE_URL=https://your-project.supabase.co<br />
            VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-medium pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Service-role, AI, email, and automation secrets must never be added to VITE_ variables.</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Secure Supabase migration</span>
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={copyToClipboard}
            >
              <span>{copied ? 'Copied SQL!' : 'Copy migration'}</span>
            </Button>
          </div>
          <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto max-h-72 border border-slate-800">
            <code>{sqlSchema}</code>
          </pre>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
};
