import type { ExchangePayload, Profile } from '@/types';

import { buildPayload } from './payload';

/**
 * Nearby (BLE) and Tap (NFC) transport.
 *
 * Real BLE/NFC need native modules (`react-native-ble-plx`,
 * `react-native-nfc-manager`) + a dev build + hardware. The app talks to these
 * through this module and ships a `simulated` provider that drives the full
 * discovery → approval → verify → import flow. `nearbyMode()`/`tapMode()` flip to
 * 'native' automatically when the module is bundled.
 *
 * Security: Tap/Nearby never import data until the user approves the peer in the
 * Confirm & Save sheet; you're only discoverable while the Exchange sheet is open.
 */

export type Card = Omit<Profile, 'kind' | 'label'>;
export type ExchangeMode = 'native' | 'simulated';

export interface Peer {
  id: string;
  name: string;
  hue: number;
  /** Radar position. */
  angle: number;
  dist: number;
}

/** The person you "meet" in the demo (prototype's INCOMING). */
export const INCOMING: Card = {
  name: 'Diego Santos',
  handle: '@diego',
  title: 'Founder',
  company: 'Verglas Coffee',
  phone: '+1 (628) 555-0193',
  email: 'diego@verglas.coffee',
  website: 'verglas.coffee',
  socials: { instagram: 'verglas.coffee', linkedin: 'diegosantos' },
  hue: 28,
  tagline: 'Single-origin, slow mornings.',
};

/** People around you for the Nearby radar (angle 0–360, dist 0–1). */
export const NEARBY: Peer[] = [
  { id: 'diego', name: 'Diego Santos', hue: 28, angle: 38, dist: 0.42 },
  { id: 'yuki', name: 'Yuki', hue: 188, angle: 122, dist: 0.66 },
  { id: 'sam', name: 'Sam', hue: 312, angle: 210, dist: 0.55 },
  { id: 'noor', name: 'Noor', hue: 78, angle: 290, dist: 0.78 },
  { id: 'eli', name: 'Eli', hue: 248, angle: 340, dist: 0.35 },
];

function bleAvailable(): boolean {
  try {
    require('react-native-ble-plx');
    return true;
  } catch {
    return false;
  }
}
function nfcAvailable(): boolean {
  try {
    require('react-native-nfc-manager');
    return true;
  } catch {
    return false;
  }
}
export const nearbyMode = (): ExchangeMode => (bleAvailable() ? 'native' : 'simulated');
export const tapMode = (): ExchangeMode => (nfcAvailable() ? 'native' : 'simulated');

/** Resolve a radar peer to a full card (Diego is fleshed out; others are minimal). */
export function cardForPeer(peer: Peer): Card {
  if (peer.id === 'diego') return INCOMING;
  return {
    name: peer.name,
    handle: '',
    title: 'On XCHANGE nearby',
    company: '',
    phone: '',
    email: '',
    website: '',
    socials: {},
    hue: peer.hue,
    tagline: '',
  };
}

/** Sign a received card so the same verification path applies to Tap/Nearby. */
export function signCard(card: Card): Promise<ExchangePayload> {
  return buildPayload({ ...card, kind: 'personal', label: 'Personal' });
}
