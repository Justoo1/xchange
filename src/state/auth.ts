import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { isConfigured, supabase } from '@/lib/supabase';

interface AuthState {
  /** Current Supabase session (null when signed out or in local mode). */
  session: Session | null;
  /** True once the initial session has been resolved. */
  ready: boolean;
}

export const useAuth = create<AuthState>(() => ({
  session: null,
  // In local (unconfigured) mode there's no auth to wait for.
  ready: !isConfigured,
}));

// Wire the session listener once at module load.
if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    useAuth.setState({ session: data.session, ready: true });
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuth.setState({ session, ready: true });
  });
}

export const useUserId = () => useAuth((s) => s.session?.user.id ?? null);

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}
