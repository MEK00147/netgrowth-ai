import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types/database';
import { demoStore } from '../lib/demoData';

export interface SignUpParams {
  email: string;
  password: string;
  fullName?: string;
  companyName?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthSessionUser {
  id: string;
  email: string;
  profile: Profile | null;
  isDemo: boolean;
}

const DEMO_AUTH_STORAGE_KEY = 'leadflow_ai_demo_auth_active';

export const authService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  isDemoSession(): boolean {
    if (!isSupabaseConfigured()) return true;
    return localStorage.getItem(DEMO_AUTH_STORAGE_KEY) === 'true';
  },

  setDemoSession(active: boolean) {
    if (active) {
      localStorage.setItem(DEMO_AUTH_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
    }
  },

  async getSession(): Promise<{ user: AuthSessionUser | null; error: Error | null }> {
    try {
      if (this.isDemoSession() || !isSupabaseConfigured()) {
        const demoUser = demoStore.getProfile();
        const active = localStorage.getItem(DEMO_AUTH_STORAGE_KEY);
        // If not configured, provide the authenticated demo session if signed in
        if (active === 'true' || !isSupabaseConfigured()) {
          return {
            user: {
              id: demoUser.id,
              email: demoUser.email,
              profile: demoUser,
              isDemo: true,
            },
            error: null,
          };
        }
        return { user: null, error: null };
      }

      if (!supabase) {
        return { user: null, error: null };
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session?.user) {
        return { user: null, error: null };
      }

      const authUser = data.session.user;
      const profile = await this.getUserProfile(authUser.id);

      return {
        user: {
          id: authUser.id,
          email: authUser.email ?? '',
          profile,
          isDemo: false,
        },
        error: null,
      };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[authService.getSession] Error:', error);
      return { user: null, error };
    }
  },

  async signUp({ email, password, fullName, companyName }: SignUpParams): Promise<{ user: AuthSessionUser | null; requiresEmailConfirmation?: boolean; error: string | null }> {
    try {
      if (!isSupabaseConfigured()) {
        // In unconfigured demo mode, simulate registration and profile setup
        this.setDemoSession(true);
        const profile = demoStore.updateProfile({
          email,
          full_name: fullName || 'Demo Sales User',
          company_name: companyName || 'Demo Enterprise Ltd',
        });
        return {
          user: {
            id: profile.id,
            email: profile.email,
            profile,
            isDemo: true,
          },
          error: null,
        };
      }

      if (!supabase) throw new Error('Supabase client is not available');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName ?? '',
            company_name: companyName ?? '',
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Registration completed but user object was not returned. Please verify your email.' };
      }

      // If Supabase requires email verification, data.session is null until confirmed
      if (!data.session) {
        return {
          user: null,
          requiresEmailConfirmation: true,
          error: null,
        };
      }

      // Upsert profile record explicitly to guarantee presence
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email ?? email,
          full_name: fullName ?? null,
          company_name: companyName ?? null,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileErr) {
        console.warn('Auto profile insertion warning:', profileErr.message);
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email ?? email,
          profile: profileData as Profile | null,
          isDemo: false,
        },
        error: null,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during signup';
      return { user: null, error: msg };
    }
  },

  async signIn({ email, password }: SignInParams): Promise<{ user: AuthSessionUser | null; error: string | null }> {
    try {
      if (!isSupabaseConfigured()) {
        this.setDemoSession(true);
        const profile = demoStore.getProfile();
        return {
          user: {
            id: profile.id,
            email: email || profile.email,
            profile,
            isDemo: true,
          },
          error: null,
        };
      }

      if (!supabase) throw new Error('Supabase client is not available');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return {
            user: null,
            error: 'Your email address is not yet confirmed. Please click the verification link sent to your inbox, or disable "Confirm email" under Authentication > Providers > Email in your Supabase dashboard to log in instantly.',
          };
        }
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'User session could not be established.' };
      }

      const profile = await this.getUserProfile(data.user.id);

      return {
        user: {
          id: data.user.id,
          email: data.user.email ?? email,
          profile,
          isDemo: false,
        },
        error: null,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials or network failure';
      return { user: null, error: msg };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      this.setDemoSession(false);
      if (supabase && isSupabaseConfigured()) {
        const { error } = await supabase.auth.signOut();
        if (error) return { error: error.message };
      }
      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign out';
      return { error: msg };
    }
  },

  async getUserProfile(userId: string): Promise<Profile | null> {
    if (!supabase || !isSupabaseConfigured()) {
      return demoStore.getProfile();
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[getUserProfile] Error fetching profile:', error.message);
        return null;
      }
      return data as Profile | null;
    } catch (e) {
      console.error('[getUserProfile] Exception:', e);
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ profile: Profile | null; error: string | null }> {
    try {
      if (this.isDemoSession() || !isSupabaseConfigured()) {
        const updated = demoStore.updateProfile(updates);
        return { profile: updated, error: null };
      }

      if (!supabase) throw new Error('Supabase client is not configured');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { profile: data as Profile, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      return { profile: null, error: msg };
    }
  },
};
