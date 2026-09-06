import React from 'react';
import { Menu, ShieldCheck, AlertCircle, Plus, Sparkles, Database } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { NavigationTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavigationTab;
  onOpenMobileNav: () => void;
  onOpenNewLeadModal: () => void;
  onOpenSchemaModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileNav,
  onOpenNewLeadModal,
  onOpenSchemaModal,
}) => {
  const { isConfigured, isDemoMode, toggleDemoMode } = useAuth();

  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Executive Lead Intelligence';
      case 'leads':
        return 'Lead Pipeline Management';
      case 'follow-ups':
        return 'Scheduled Follow-ups & Touchpoints';
      case 'analytics':
        return 'Predictive Analytics (Phase 2)';
      case 'settings':
        return 'System & Organization Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{getTitle()}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Supabase Status Indicator */}
        {isConfigured ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supabase RLS Active</span>
          </div>
        ) : (
          <button
            onClick={onOpenSchemaModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-medium transition cursor-pointer"
            title="Click to view database schema & environment instructions"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Supabase Env Pending</span>
            <span className="md:hidden">Setup</span>
          </button>
        )}

        {/* Demo Mode Toggle Button */}
        <button
          type="button"
          onClick={() => toggleDemoMode(!isDemoMode)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition duration-150 cursor-pointer ${
            isDemoMode
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
          title="Toggle between Demo presentation data and live user database"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isDemoMode ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">{isDemoMode ? 'Demo Sandbox' : 'Live Mode'}</span>
        </button>

        {/* Quick Schema viewer */}
        <button
          onClick={onOpenSchemaModal}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
          title="View PostgreSQL Schema & RLS policies"
        >
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span>SQL Schema</span>
        </button>

        {/* New Lead Quick Action */}
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onOpenNewLeadModal}
        >
          <span>New Lead</span>
        </Button>
      </div>
    </header>
  );
};
