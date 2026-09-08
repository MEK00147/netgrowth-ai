import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { NavigationTab } from './components/layout/Sidebar';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { LeadDetails } from './pages/LeadDetails';
import { FollowUps } from './pages/FollowUps';
import { Settings } from './pages/Settings';
import { CreateLeadModal } from './components/leads/CreateLeadModal';
import { DatabaseSchemaModal } from './components/database/DatabaseSchemaModal';
import { Lead, CreateLeadInput } from './types/database';
import { leadService } from './services/leadService';
import { Card, CardHeader, CardBody } from './components/ui/Card';
import { BarChart3, Sparkles } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading, isDemoMode } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setCurrentTab('leads');
  };

  const handleCreateLead = async (input: CreateLeadInput): Promise<boolean> => {
    const { data, error } = await leadService.createLead(input);
    if (error) {
      alert(`Failed to create lead: ${error}`);
      return false;
    }
    if (data) {
      showNotification(`Lead for ${data.first_name} ${data.last_name ?? ''} created successfully.`);
      setSelectedLead(data);
      setCurrentTab('leads');
      return true;
    }
    return false;
  };

  // 1. Loading screen while Supabase auth session initializes
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Initializing NetGrowth...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated user (and not in demo presentation sandbox)
  if (!user && !isDemoMode) {
    if (authView === 'signup') {
      return (
        <>
          <Signup
            onNavigateToLogin={() => setAuthView('login')}
            onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
          />
          <DatabaseSchemaModal
            isOpen={isSchemaModalOpen}
            onClose={() => setIsSchemaModalOpen(false)}
          />
        </>
      );
    }

    return (
      <>
        <Login
          onNavigateToSignup={() => setAuthView('signup')}
          onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        />
        <DatabaseSchemaModal
          isOpen={isSchemaModalOpen}
          onClose={() => setIsSchemaModalOpen(false)}
        />
      </>
    );
  }

  // 3. Authenticated or Demo Application Shell
  return (
    <AppShell
      currentTab={currentTab}
      onSelectTab={(tab) => {
        if (tab !== 'leads') {
          setSelectedLead(null);
        }
        setCurrentTab(tab);
      }}
      onOpenNewLeadModal={() => setIsCreateLeadOpen(true)}
      onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
    >
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tab Switching */}
      {currentTab === 'dashboard' && (
        <Dashboard
          onSelectLead={handleSelectLead}
          onNavigateToLeads={() => {
            setSelectedLead(null);
            setCurrentTab('leads');
          }}
          onOpenNewLeadModal={() => setIsCreateLeadOpen(true)}
        />
      )}

      {currentTab === 'leads' && (
        <>
          {selectedLead ? (
            <LeadDetails
              leadId={selectedLead.id}
              onBack={() => setSelectedLead(null)}
              onLeadDeleted={() => {
                setSelectedLead(null);
                showNotification('Lead deleted successfully.');
              }}
            />
          ) : (
            <Leads
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenNewLeadModal={() => setIsCreateLeadOpen(true)}
            />
          )}
        </>
      )}

      {currentTab === 'follow-ups' && (
        <FollowUps
          onSelectLead={(lead) => {
            setSelectedLead(lead);
            setCurrentTab('leads');
          }}
        />
      )}

      {currentTab === 'analytics' && (
        <div className="space-y-4 max-w-3xl">
          <Card>
            <CardHeader
              title="Sales & AI Conversion Analytics"
              subtitle="Predictive scoring accuracy, conversion funnel, and pipeline velocity"
            />
            <CardBody className="py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Advanced Analytics — Phase 2</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Aggregated conversion reporting, AI scoring accuracy calibration, and automated follow-up success rates will be unlocked in Phase 2 alongside n8n automation workflows.
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {currentTab === 'settings' && (
        <Settings onOpenSchemaModal={() => setIsSchemaModalOpen(true)} />
      )}

      {/* Global Modals */}
      <CreateLeadModal
        isOpen={isCreateLeadOpen}
        onClose={() => setIsCreateLeadOpen(false)}
        onSubmit={handleCreateLead}
      />

      <DatabaseSchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />
    </AppShell>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
