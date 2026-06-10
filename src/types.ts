/** Profile flavor — the Personal / Work switcher. */
export type ProfileKind = 'personal' | 'work';

export type ExchangeMethod = 'qr' | 'tap' | 'nearby';

export type CardLayout = 'minimal' | 'gradient' | 'bold';

/** Socials are a fixed set of optional handles, per the design. */
export interface Socials {
  instagram?: string;
  linkedin?: string;
  x?: string;
  website?: string;
}

/** The card a user shares. One per ProfileKind. */
export interface Profile {
  /** DB row id (cloud mode only). */
  id?: string;
  kind: ProfileKind;
  /** "Personal" / "Work" */
  label: string;
  name: string;
  /** "@mara" */
  handle: string;
  /** "Photographer · Traveler" */
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  socials: Socials;
  /** Avatar/card gradient hue (0–360). */
  hue: number;
  tagline: string;
}

/** A person you exchanged with. */
export interface Contact {
  id: string;
  name: string;
  handle?: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website?: string;
  socials: Socials;
  hue: number;
  tagline?: string;
  /** "QR · Pop-up dinner", "Tap · Rooftop party", "Nearby · The Mill café". */
  met: string;
  /** Grouping label: "Today" | "Yesterday" | "Mon" | "Mar 4" | "Now". */
  when: string;
  /** Free-text note captured at save time. */
  note?: string;
  fav: boolean;
  method: ExchangeMethod;
  metAt: number;
  /** Integrity verified on import. */
  verified: boolean;
  /** The other user's id (cloud mode) — used to dedupe repeat exchanges. */
  sourceUser?: string;
}

/** Privacy toggles (Profile → Privacy). */
export interface Privacy {
  /** Require approval before sharing your phone number. */
  approve: boolean;
  /** Include socials on your shared card. */
  socials: boolean;
  /** Be discoverable to Nearby devices. */
  presence: boolean;
}

export interface Settings {
  /** Brand accent as a hex string (one of theme ACCENTS). */
  accent: string;
  cardLayout: CardLayout;
  defaultMethod: ExchangeMethod;
  privacy: Privacy;
}

/** On-the-wire exchange payload (QR / BLE / NFC). */
export interface ExchangePayload {
  v: number;
  /** The shared card. */
  p: Omit<Profile, 'kind' | 'label'>;
  /** Issued-at epoch ms. */
  t: number;
  /** Random nonce (hex). */
  n: string;
  /** Integrity signature. */
  s: string;
}
