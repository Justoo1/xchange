import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_KEY;

/**
 * True when a Supabase project is configured via env. When false the app runs in
 * offline/simulated mode: no auth/sync, and Exchange uses the local demo flow.
 */
export const isConfigured = Boolean(url && anonKey);

/**
 * Storage that no-ops when there's no `window` (Node — e.g. Expo's web SSR/
 * prerender pass), and uses AsyncStorage in a real client (native or browser).
 * Without this guard the auth client touches localStorage during prerender and
 * crashes with "window is not defined".
 */
const hasWindow = typeof window !== 'undefined';
const safeStorage = {
  getItem: (k: string) => (hasWindow ? AsyncStorage.getItem(k) : Promise.resolve(null)),
  setItem: (k: string, v: string) => (hasWindow ? AsyncStorage.setItem(k, v) : Promise.resolve()),
  removeItem: (k: string) => (hasWindow ? AsyncStorage.removeItem(k) : Promise.resolve()),
};

/**
 * The Supabase client, or null when unconfigured. Auth sessions persist to
 * AsyncStorage and auto-refresh; URL session detection is off (native app).
 */
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        storage: safeStorage,
        autoRefreshToken: hasWindow,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

/** Throws if called when unconfigured — use after an `isConfigured` guard. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and _ANON_KEY in .env');
  return supabase;
}
