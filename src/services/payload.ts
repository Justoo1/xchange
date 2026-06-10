import * as Crypto from 'expo-crypto';

import type { ExchangePayload, Profile } from '@/types';

/**
 * Integrity & anti-tamper for exchanged cards. See README → Security.
 *
 * The risky channels are Tap (NFC) and Nearby (BLE). This layer provides an
 * integrity signature (SHA-256 over the canonical card + nonce + app pepper) and
 * a nonce/issued-at for freshness, so tampered or replayed captures are flagged.
 * It does NOT claim identity attestation (no PKI) — the user's explicit approval
 * in the Confirm & Save sheet is the primary gate; the signature is defense in depth.
 */

type Card = Omit<Profile, 'kind' | 'label'>;

const SCHEME = 'xchange';
const VERSION = 2;
const APP_PEPPER = 'xchange.v2.integrity';

/** Tap/Nearby captures older than this (ms) are rejected as stale. */
export const FRESHNESS_WINDOW_MS = 90_000;

function canonical(c: Card, t: number, n: string): string {
  return JSON.stringify({
    name: c.name,
    handle: c.handle,
    title: c.title,
    company: c.company,
    phone: c.phone,
    email: c.email,
    website: c.website,
    socials: c.socials,
    hue: c.hue,
    tagline: c.tagline,
    t,
    n,
    pepper: APP_PEPPER,
  });
}

function sign(c: Card, t: number, n: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, canonical(c, t, n));
}

/** Build a fresh, signed payload for the given profile. */
export async function buildPayload(profile: Profile): Promise<ExchangePayload> {
  const { kind: _k, label: _l, ...card } = profile;
  const t = Date.now();
  const bytes = await Crypto.getRandomBytesAsync(8);
  const n = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const s = await sign(card, t, n);
  return { v: VERSION, p: card, t, n, s };
}

/** Encode a payload into a scannable / transmittable deep link. */
export function encodeLink(payload: ExchangePayload): string {
  return `${SCHEME}://x?d=${encodeURIComponent(JSON.stringify(payload))}`;
}

/** Parse a scanned string back into a payload, or null if it isn't ours. */
export function parseLink(raw: string): ExchangePayload | null {
  try {
    const trimmed = raw.trim();
    const q = trimmed.indexOf('?d=');
    if (!trimmed.startsWith(`${SCHEME}://`) || q === -1) return null;
    const obj = JSON.parse(decodeURIComponent(trimmed.slice(q + 3))) as ExchangePayload;
    if (obj.v !== VERSION || !obj.p || !obj.s || !obj.n || !obj.t) return null;
    return obj;
  } catch {
    return null;
  }
}

export interface VerificationResult {
  verified: boolean;
  fresh: boolean;
  reason?: string;
}

/** Verify integrity (and, for live channels, freshness) of a received payload. */
export async function verifyPayload(
  payload: ExchangePayload,
  requireFresh: boolean,
): Promise<VerificationResult> {
  const expected = await sign(payload.p, payload.t, payload.n);
  const verified = expected === payload.s;
  const age = Date.now() - payload.t;
  const fresh = age >= 0 && age <= FRESHNESS_WINDOW_MS;
  if (!verified) return { verified: false, fresh, reason: 'Integrity check failed — card may be tampered.' };
  if (requireFresh && !fresh) return { verified, fresh: false, reason: 'This capture has expired. Ask them to share again.' };
  return { verified, fresh };
}

/** Stable id for a received contact, so duplicates collapse. */
export async function contactIdFor(c: Pick<Card, 'name' | 'email' | 'phone'>): Promise<string> {
  const basis = `${c.name}|${c.email}|${c.phone}`.toLowerCase();
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, basis);
}
