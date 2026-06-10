import { isConfigured, requireSupabase, supabase } from '@/lib/supabase';
import type { Card } from '@/services/exchange';
import type { ExchangeMethod, Profile } from '@/types';

/**
 * Client side of the secure, server-mediated exchange.
 *
 * The sharer mints a short-lived, single-use token (server RPC) and encodes it
 * into the QR / NFC tag / Nearby broadcast. A claimer calls `requestExchange`,
 * which the SHARER must approve (`respondExchange`) before any card is released.
 * Identity is server-verified (a token maps to a real authenticated user), so
 * imported contacts are marked `verified`. See supabase/migrations/0001_init.sql.
 */

const SCHEME = 'xchange';

export function encodeToken(token: string): string {
  return `${SCHEME}://x?t=${encodeURIComponent(token)}`;
}

export function parseToken(raw: string): string | null {
  const s = raw.trim();
  const i = s.indexOf('?t=');
  if (!s.startsWith(`${SCHEME}://`) || i === -1) return null;
  return decodeURIComponent(s.slice(i + 3)) || null;
}

function cardPayload(p: Profile): Record<string, unknown> {
  return {
    name: p.name,
    handle: p.handle,
    title: p.title,
    company: p.company,
    phone: p.phone,
    email: p.email,
    website: p.website,
    socials: p.socials,
    hue: p.hue,
    tagline: p.tagline,
  };
}

/** Mint a token for one of my cards (cloud). Throws if unconfigured/no id. */
export async function createMyToken(card: Profile, method: ExchangeMethod, ttl = 90): Promise<string> {
  if (!card.id) throw new Error('Save your card first.');
  const { data, error } = await requireSupabase().rpc('create_exchange_token', {
    p_card_id: card.id,
    p_method: method,
    p_ttl: ttl,
  });
  if (error) throw error;
  return data as string;
}

export interface RequestResult {
  requestId: string;
  name: string;
  hue: number;
  title: string;
}

/** Claim a token → creates a pending request the sharer must approve. */
export async function requestExchange(token: string, myCard: Profile): Promise<RequestResult> {
  const { data, error } = await requireSupabase().rpc('request_exchange', {
    p_token: token,
    p_my_card: cardPayload(myCard),
  });
  if (error) throw error;
  const r = data as { request_id: string; name: string; hue: number; title: string };
  return { requestId: r.request_id, name: r.name, hue: r.hue, title: r.title };
}

export async function respondExchange(requestId: string, approve: boolean): Promise<void> {
  const { error } = await requireSupabase().rpc('respond_exchange', {
    p_request_id: requestId,
    p_approve: approve,
  });
  if (error) throw error;
}

export interface IncomingRequest {
  id: string;
  requesterCard: Card & { user_id?: string };
  method: ExchangeMethod;
}

/** Sharer: watch for incoming requests to approve. Returns an unsubscribe fn. */
export function subscribeIncoming(userId: string, onRequest: (r: IncomingRequest) => void): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`incoming:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'pending_exchanges', filter: `sharer=eq.${userId}` },
      (payload) => {
        const row = payload.new as { id: string; requester_card: Card; method: ExchangeMethod };
        onRequest({ id: row.id, requesterCard: row.requester_card, method: row.method });
      },
    )
    .subscribe();
  return () => {
    supabase?.removeChannel(channel);
  };
}

export interface RequestResolution {
  status: 'approved' | 'declined';
  sharerCard?: Card & { user_id?: string };
}

/** Requester: watch my pending request for the sharer's decision. */
export function subscribeRequest(requestId: string, onResolve: (r: RequestResolution) => void): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`request:${requestId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'pending_exchanges', filter: `id=eq.${requestId}` },
      (payload) => {
        const row = payload.new as { status: 'approved' | 'declined'; sharer_card?: Card & { user_id?: string } };
        if (row.status === 'approved' || row.status === 'declined') {
          onResolve({ status: row.status, sharerCard: row.sharer_card });
        }
      },
    )
    .subscribe();
  return () => {
    supabase?.removeChannel(channel);
  };
}

export { isConfigured };
