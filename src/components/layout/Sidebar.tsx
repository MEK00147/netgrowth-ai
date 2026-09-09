import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  BarChart3,
  Settings,
  LogOut,
  Database,
  Cpu,
  Sparkles,
  Shield,
  UserCheck,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavigationTab = 'dashboard' | 'leads' | 'follow-ups' | 'analytics' | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenSchemaModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenSchemaModal }) => {
  const {
    user,
    organization,
    role,
    isAdmin,
    signOut,
    isDemoMode,
    availablePersonas,
    activePersonaId,
    switchDemoPersona,
  } = useAuth();

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
    disabled?: boolean;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Lead Management', icon: Users },
    { id: 'follow-ups', label: 'Follow-ups', icon: CalendarClock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 'Phase 2', disabled: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight">NetGrowth</span>
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800/60">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Sales Automation Platform</p>
          </div>
        </div>
      </div>

      {/* Organization & Active Role Badge */}
      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/70">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400 font-medium flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{organization?.name || 'NetGrowth Workspace'}</span>
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isAdmin
                ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                : 'bg-indigo-950 text-indigo-300 border border-indigo-800/80'
            }`}
          >
            {role || 'Admin'}
          </span>
        </div>
      </div>

      {/* Persona Role Switcher in Demo Mode */}
      {isDemoMode && availablePersonas && availablePersonas.length > 0 && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles className="w-3 h-3" /> Persona Role Switcher
            </span>
          </div>
          <select
            value={activePersonaId || ''}
            onChange={(e) => switchDemoPersona(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1.5 focus:outline-hidden focus:border-indigo-500 cursor-pointer font-medium"
            title="Switch user role and test organization access control"
          >
            {availablePersonas.map((p) => (
              <option key={p.profile.id} value={p.profile.id}>
                {p.profile.full_name} ({p.role.toUpperCase()})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 leading-tight">
            Switch between Admin (full view & assignment) and Sales Specialists (assigned leads only).
          </p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (item.disabled) {
            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-400 opacity-60 cursor-not-allowed text-xs font-medium"
                title="Coming in Phase 2"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}

        <div className="pt-4 px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Developer & Database
        </div>
        <button
          onClick={onOpenSchemaModal}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition duration-150 cursor-pointer text-left"
        >
          <Database className="w-4 h-4 text-slate-400" />
          <span>PostgreSQL Schema & RLS</span>
        </button>
      </nav>

      {/* User Footer Profile & Sign Out */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0 border border-slate-600">
              {user?.profile?.full_name ? user.profile.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.profile?.full_name || 'Authenticated User'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out of application"
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-slate-800 transition duration-150 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
