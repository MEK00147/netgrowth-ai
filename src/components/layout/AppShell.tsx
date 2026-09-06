import React, { useState } from 'react';
import { Sidebar, NavigationTab } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, ArrowRight, Database, X } from 'lucide-react';

interface AppShellProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenNewLeadModal: () => void;
  onOpenSchemaModal: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewLeadModal,
  onOpenSchemaModal,
  children,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dismissEnvNotice, setDismissEnvNotice] = useState(false);
  const { isConfigured, configError, isDemoMode } = useAuth();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={onSelectTab}
          onOpenSchemaModal={onOpenSchemaModal}
        />
      </div>

      {/* Mobile Nav Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        onOpenSchemaModal={onOpenSchemaModal}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Environment Alert Banner (if Supabase not configured in preview) */}
        {!isConfigured && !dismissEnvNotice && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-medium flex items-center justify-between shadow-xs z-30 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <AlertCircle className="w-4 h-4 shrink-0 text-slate-950" />
              <span className="truncate">
                <strong>Supabase Configuration Notice:</strong> {configError ?? 'VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are required for real database persistence.'} Running in Client Presentation Sandbox Mode.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <button
                onClick={onOpenSchemaModal}
                className="underline hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View Schema & Setup</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => setDismissEnvNotice(true)}
                className="hover:opacity-75 p-0.5 rounded cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenNewLeadModal={onOpenNewLeadModal}
          onOpenSchemaModal={onOpenSchemaModal}
        />

        {/* Page Content Scroll Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};
