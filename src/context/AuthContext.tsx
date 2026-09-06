import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, AuthSessionUser, SignInParams, SignUpParams } from '../services/authService';
import { isSupabaseConfigured, getSupabaseConfigError, supabase } from '../lib/supabase';
import { Profile } from '../types/database';

interface AuthContextType {
  user: AuthSessionUser | null;
  loading: boolean;
  isConfigured: boolean;
  configError: string | null;
  isDemoMode: boolean;
  signIn: (params: SignInParams) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
  toggleDemoMode: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();
  const configError = getSupabaseConfigError();
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (!isConfigured) return true;
    return authService.isDemoSession();
  });

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      const { user: sessionUser } = await authService.getSession();
      setUser(sessionUser);
    } catch (err) {
      console.error('Session restoration failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();

    // Subscribe to Supabase auth state change if configured
    if (supabase && isConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await authService.getUserProfile(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            profile,
            isDemo: false,
          });
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const profile = await authService.getUserProfile(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            profile,
            isDemo: false,
          });
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [isConfigured, refreshSession]);

  const signIn = async (params: SignInParams): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const result = await authService.signIn(params);
    setLoading(false);
    if (result.error) {
      return { success: false, error: result.error };
    }
    setUser(result.user);
    return { success: true };
  };

  const signUp = async (params: SignUpParams): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const result = await authService.signUp(params);
    setLoading(false);
    if (result.error) {
      return { success: false, error: result.error };
    }
    setUser(result.user);
    return { success: true };
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    await authService.signOut();
    setUser(null);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured,
        configError,
        isDemoMode,
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
