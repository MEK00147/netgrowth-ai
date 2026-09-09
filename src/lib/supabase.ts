/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
// Extract the first URL token cleanly in case environment variables were pasted together
export const supabaseUrl = rawUrl ? rawUrl.split(/\s+/)[0] : undefined;

const rawKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim();
export const supabasePublishableKey = rawKey ? rawKey.split(/\s+/)[0] : undefined;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabasePublishableKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabasePublishableKey !== 'your-supabase-anon-or-publishable-key' &&
    supabaseUrl.startsWith('http')
  );
};

export const getSupabaseConfigError = (): string | null => {
  if (!supabaseUrl && !supabasePublishableKey) {
    return 'Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.';
  }
  if (!supabaseUrl) {
    return 'Missing required environment variable: VITE_SUPABASE_URL.';
  }
  if (!supabasePublishableKey) {
    return 'Missing required environment variable: VITE_SUPABASE_PUBLISHABLE_KEY.';
  }
  if (!supabaseUrl.startsWith('http')) {
    return 'Invalid VITE_SUPABASE_URL: must start with https:// or http://.';
  }
  return null;
};

// Singleton Supabase Client instance (null if unconfigured)
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Returns the active Supabase client or throws a descriptive developer error
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    const errorMsg = getSupabaseConfigError() ?? 'Supabase is not configured.';
    throw new Error(`[Supabase Configuration Error] ${errorMsg}`);
  }
  return supabase;
};
