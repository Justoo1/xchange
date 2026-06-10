import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { whenLabel } from '@/lib/format';
import { isConfigured, requireSupabase, supabase } from '@/lib/supabase';
import { useUserId } from '@/state/auth';
import { useContacts as useLocalContacts } from '@/state/contacts';
import type { Contact, ExchangeMethod } from '@/types';

function rowToContact(row: Record<string, unknown>): Contact {
  const metAt = row.met_at ? Date.parse(row.met_at as string) : Date.now();
  return {
    id: row.id as string,
    name: (row.name as string) ?? '',
    handle: (row.handle as string) ?? '',
    title: (row.title as string) ?? '',
    company: (row.company as string) ?? '',
    phone: (row.phone as string) ?? '',
    email: (row.email as string) ?? '',
    website: (row.website as string) ?? '',
    socials: (row.socials as Contact['socials']) ?? {},
    hue: (row.hue as number) ?? 200,
    tagline: (row.tagline as string) ?? '',
    met: (row.met as string) ?? '',
    note: (row.note as string) ?? '',
    fav: Boolean(row.fav),
    method: (row.method as ExchangeMethod) ?? 'qr',
    metAt,
    when: whenLabel(metAt),
    verified: Boolean(row.verified),
    sourceUser: (row.source_user as string) ?? undefined,
  };
}

async function fetchContacts(): Promise<Contact[]> {
  const { data, error } = await requireSupabase()
    .from('contacts')
    .select('*')
    .order('met_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToContact);
}

export function useContactList(): { contacts: Contact[]; loading: boolean } {
  const local = useLocalContacts((s) => s.contacts);
  const userId = useUserId();
  const q = useQuery({ queryKey: ['contacts', userId], enabled: isConfigured && !!userId, queryFn: fetchContacts });
  if (!isConfigured) return { contacts: local, loading: false };
  return { contacts: q.data ?? [], loading: q.isLoading };
}

/** Keep the contact list live (mutual swaps arrive from the other device). */
export function useContactsRealtime() {
  const userId = useUserId();
  const qc = useQueryClient();
  useEffect(() => {
    const sb = supabase;
    if (!isConfigured || !sb || !userId) return;
    const channel = sb
      .channel(`contacts:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts', filter: `owner=eq.${userId}` }, () => {
        qc.invalidateQueries({ queryKey: ['contacts', userId] });
      })
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [userId, qc]);
}

export function useAddContact() {
  const localAdd = useLocalContacts((s) => s.addContact);
  const userId = useUserId();
  const qc = useQueryClient();
  return async (c: Contact) => {
    if (!isConfigured) {
      localAdd(c);
      return;
    }
    const { error } = await requireSupabase()
      .from('contacts')
      .upsert(
        {
          owner: userId,
          source_user: c.sourceUser ?? null,
          name: c.name,
          handle: c.handle ?? '',
          title: c.title,
          company: c.company,
          phone: c.phone,
          email: c.email,
          website: c.website ?? '',
          socials: c.socials,
          hue: c.hue,
          tagline: c.tagline ?? '',
          met: c.met,
          note: c.note ?? '',
          method: c.method,
          verified: c.verified,
        },
        { onConflict: 'owner,source_user' },
      );
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ['contacts', userId] });
  };
}

export function useToggleFav() {
  const localToggle = useLocalContacts((s) => s.toggleFav);
  const userId = useUserId();
  const qc = useQueryClient();
  return async (id: string, fav: boolean) => {
    if (!isConfigured) {
      localToggle(id);
      return;
    }
    const { error } = await requireSupabase().from('contacts').update({ fav }).eq('id', id);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ['contacts', userId] });
  };
}

export function useRemoveContact() {
  const localRemove = useLocalContacts((s) => s.removeContact);
  const userId = useUserId();
  const qc = useQueryClient();
  return async (id: string) => {
    if (!isConfigured) {
      localRemove(id);
      return;
    }
    const { error } = await requireSupabase().from('contacts').delete().eq('id', id);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ['contacts', userId] });
  };
}

/** Look up a single contact by id (from the cached list). */
export function useContact(id: string | undefined): Contact | undefined {
  const { contacts } = useContactList();
  return contacts.find((c) => c.id === id);
}
