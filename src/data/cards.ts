import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { hueFromHex } from '@/lib/color';
import { isConfigured, requireSupabase } from '@/lib/supabase';
import { useAuth, useUserId } from '@/state/auth';
import { useProfile } from '@/state/profile';
import { useSettings } from '@/state/settings';
import type { Profile, ProfileKind } from '@/types';
import { CARD_KINDS, defaultCard } from './defaults';

type ByKind = Record<ProfileKind, Profile>;

/**
 * Brand the user's own cards from the chosen accent: the avatar + gradient hue
 * follow the Tweaks → Brand → Accent swatch. Presentational only (the stored
 * `hue` is untouched), and applies to *my* cards — saved contacts keep theirs.
 */
function brandFromAccent(byKind: ByKind, accent: string): ByKind {
  const hue = Math.round(hueFromHex(accent));
  return {
    personal: { ...byKind.personal, hue },
    work: { ...byKind.work, hue },
  };
}

function rowToProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    kind: row.kind as ProfileKind,
    label: (row.label as string) || (row.kind === 'work' ? 'Work' : 'Personal'),
    name: (row.name as string) ?? '',
    handle: (row.handle as string) ?? '',
    title: (row.title as string) ?? '',
    company: (row.company as string) ?? '',
    phone: (row.phone as string) ?? '',
    email: (row.email as string) ?? '',
    website: (row.website as string) ?? '',
    socials: (row.socials as Profile['socials']) ?? {},
    hue: (row.hue as number) ?? 158,
    tagline: (row.tagline as string) ?? '',
  };
}

/** Merge DB rows over empty defaults so both kinds always exist. */
function mergeByKind(rows: Profile[]): ByKind {
  const base: ByKind = { personal: defaultCard('personal'), work: defaultCard('work') };
  rows.forEach((p) => (base[p.kind] = p));
  return base;
}

async function fetchCards(): Promise<Profile[]> {
  const { data, error } = await requireSupabase().from('cards').select('*');
  if (error) throw error;
  return (data ?? []).map(rowToProfile);
}

/** Both cards keyed by kind (defaults filled for any missing kind). */
export function useCards(): { byKind: ByKind; loading: boolean } {
  const localProfiles = useProfile((s) => s.profiles);
  const accent = useSettings((s) => s.accent);
  const userId = useUserId();
  const q = useQuery({
    queryKey: ['cards', userId],
    enabled: isConfigured && !!userId,
    queryFn: fetchCards,
  });
  if (!isConfigured) return { byKind: brandFromAccent(localProfiles, accent), loading: false };
  return { byKind: brandFromAccent(mergeByKind(q.data ?? []), accent), loading: q.isLoading };
}

/** Save a card (insert/update). Returns a stable async function. */
export function useUpdateCard() {
  const localUpdate = useProfile((s) => s.updateProfile);
  const localProfiles = useProfile((s) => s.profiles);
  const userId = useUserId();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ kind, full }: { kind: ProfileKind; full: Profile }) => {
      const sb = requireSupabase();
      const { kind: _k, id: _id, ...rest } = full;
      const { error } = await sb
        .from('cards')
        .upsert({ user_id: userId, kind, ...rest }, { onConflict: 'user_id,kind' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cards', userId] }),
  });

  return async (kind: ProfileKind, patch: Partial<Profile>) => {
    if (!isConfigured) {
      localUpdate(kind, patch);
      return;
    }
    // Merge patch onto the current value from cache so upsert has all columns.
    const current =
      qc.getQueryData<Profile[]>(['cards', userId])?.find((c) => c.kind === kind) ??
      defaultCard(kind);
    await mutation.mutateAsync({ kind, full: { ...current, ...patch, kind } });
  };
}

/** Whether the user has completed onboarding (a named personal card exists). */
export function useHasCard(): { ready: boolean; has: boolean } {
  const authReady = useAuth((s) => s.ready);
  const localOnboarded = useProfile((s) => s.onboarded);
  const { byKind, loading } = useCards();
  if (!isConfigured) return { ready: true, has: localOnboarded };
  return { ready: authReady && !loading, has: byKind.personal.name.trim().length > 0 };
}

export { CARD_KINDS };
