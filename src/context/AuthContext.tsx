import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, AuthSessionUser, SignInParams, SignUpParams } from '../services/authService';
import { isSupabaseConfigured, getSupabaseConfigError, supabase } from '../lib/supabase';
import { Profile, Organization, UserRole } from '../types/database';
import { organizationService } from '../services/organizationService';
import { demoStore, DEMO_PERSONAS } from '../lib/demoData';

interface AuthContextType {
  user: AuthSessionUser | null;
  organization: Organization | null;
  role: UserRole | null;
  isAdmin: boolean;
  isSales: boolean;
  loading: boolean;
  isConfigured: boolean;
  configError: string | null;
  isDemoMode: boolean;
  availablePersonas: { profile: Profile; role: UserRole }[];
  activePersonaId: string | null;
  switchDemoPersona: (personaId: string) => Promise<void>;
  signIn: (params: SignInParams) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
  toggleDemoMode: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();
  const configError = getSupabaseConfigError();
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (!isConfigured) return true;
    return authService.isDemoSession();
  });
  const [activePersonaId, setActivePersonaId] = useState<string | null>(() => {
    return demoStore.getActivePersona().profile.id;
  });

  const loadOrgContext = useCallback(async (userId: string) => {
    try {
      const { data } = await organizationService.getUserOrganization(userId);
      if (data) {
        setOrganization(data.organization);
        setRole(data.role);
      } else {
        setOrganization(null);
        setRole(null);
      }
    } catch (e) {
      console.error('Failed to load organization context:', e);
      setOrganization(null);
      setRole(null);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      if (authService.isDemoSession() || !isSupabaseConfigured()) {
        const activePersona = demoStore.getActivePersona();
        setActivePersonaId(activePersona.profile.id);
        const demoUser: AuthSessionUser = {
          id: activePersona.profile.id,
          email: activePersona.profile.email,
          profile: activePersona.profile,
          isDemo: true,
        };
        setUser(demoUser);
        await loadOrgContext(activePersona.profile.id);
      } else {
        const { user: sessionUser } = await authService.getSession();
        setUser(sessionUser);
        if (sessionUser) {
          await loadOrgContext(sessionUser.id);
        } else {
          setOrganization(null);
          setRole(null);
        }
      }
    } catch (err) {
      console.error('Session restoration failed:', err);
      setUser(null);
      setOrganization(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [loadOrgContext]);

  useEffect(() => {
    refreshSession();

    if (supabase && isConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await authService.getUserProfile(session.user.id);
          const newUser: AuthSessionUser = {
            id: session.user.id,
            email: session.user.email ?? '',
            profile,
            isDemo: false,
          };
          setUser(newUser);
          await loadOrgContext(session.user.id);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setOrganization(null);
          setRole(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const profile = await authService.getUserProfile(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            profile,
            isDemo: false,
          });
          await loadOrgContext(session.user.id);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [isConfigured, refreshSession, loadOrgContext]);

  const switchDemoPersona = async (personaId: string) => {
    demoStore.setActivePersona(personaId);
    setActivePersonaId(personaId);
    await refreshSession();
  };

  const signIn = async (params: SignInParams): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const result = await authService.signIn(params);
    setLoading(false);
    if (result.error) {
      return { success: false, error: result.error };
    }
    setUser(result.user);
    if (result.user) {
      await loadOrgContext(result.user.id);
    }
    return { success: true };
  };

  const signUp = async (params: SignUpParams): Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }> => {
    setLoading(true);
    const result = await authService.signUp(params);
    setLoading(false);
    if (result.error) {
      return { success: false, error: result.error };
    }
    if (result.requiresEmailConfirmation) {
      return { success: true, requiresEmailConfirmation: true };
    }
    setUser(result.user);
    if (result.user) {
      await loadOrgContext(result.user.id);
    }
    return { success: true };
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    await authService.signOut();
    setUser(null);
    setOrganization(null);
    setRole(null);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No active session' };
    const { profile, error } = await authService.updateProfile(user.id, updates);
    if (error) return { success: false, error };
    if (profile) {
      setUser((prev) => (prev ? { ...prev, profile } : null));
    }
    return { success: true };
  };

  const toggleDemoMode = (enabled: boolean) => {
    authService.setDemoSession(enabled);
    setIsDemoMode(enabled);
    refreshSession();
  };

  const isAdmin = role === 'admin';
  const isSales = role === 'sales';

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        role,
        isAdmin,
        isSales,
        loading,
        isConfigured,
        configError,
        isDemoMode,
        availablePersonas: DEMO_PERSONAS,
        activePersonaId,
        switchDemoPersona,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshSession,
        toggleDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
