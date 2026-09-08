import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  LayoutDashboard,
  Users,
  CalendarClock,
  BarChart3,
  Settings,
  LogOut,
  Database,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavigationTab } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenSchemaModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onOpenSchemaModal,
}) => {
  const { user, signOut, isDemoMode } = useAuth();

  const handleItemClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer Menu */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-72 max-w-[85vw] h-full bg-slate-900 text-slate-200 flex flex-col z-10 shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">NetGrowth</span>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 px-1 py-0.5 rounded border border-indigo-800">
                      AI
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Sales Automation Engine</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sandbox Notice */}
            {isDemoMode && (
              <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] font-medium leading-tight">Client Demo Sandbox Active</span>
              </div>
            )}

            {/* Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <button
                onClick={() => handleItemClick('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                  currentTab === 'dashboard'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleItemClick('leads')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                  currentTab === 'leads'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Lead Management</span>
              </button>

              <button
                onClick={() => handleItemClick('follow-ups')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                  currentTab === 'follow-ups'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <CalendarClock className="w-4 h-4" />
                <span>Follow-ups</span>
              </button>

              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-400 opacity-60 text-xs font-medium">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                  Phase 2
                </span>
              </div>

              <button
                onClick={() => handleItemClick('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                  currentTab === 'settings'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <div className="pt-4 border-t border-slate-800 my-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenSchemaModal();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Database className="w-4 h-4 text-slate-400" />
                  <span>PostgreSQL Schema & RLS</span>
                </button>
              </div>
            </nav>

            {/* Profile */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0">
                    {user?.profile?.full_name ? user.profile.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {user?.profile?.full_name || 'Authenticated User'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    signOut();
                  }}
                  className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
