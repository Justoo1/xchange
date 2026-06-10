/**
 * Xchange design system — exact tokens from the XCHANGE handoff (XCHANGE.html).
 * Premium dark canvas, Space Grotesk display + Manrope body, mint accent.
 */
import { mix, withAlpha } from '@/lib/color';

export const colors = {
  bg: '#0c0e12',
  s1: '#14161c',
  s2: '#1b1e26',
  s3: '#23262f',
  line: 'rgba(255,255,255,0.08)',
  line2: 'rgba(255,255,255,0.14)',
  text: '#f3f5f8',
  dim: '#a4abb6',
  faint: '#6b7280',
  white: '#ffffff',
  qrInk: '#0a0b0d',
  scrim: 'rgba(4,5,8,0.62)',
  scrimDark: 'rgba(4,5,8,0.88)',
} as const;

/** The 5 brand accents from the Tweaks panel (mint is the default). */
export const ACCENTS = ['#6ce5b1', '#6cb8e5', '#b18cff', '#e5c46c', '#e8e8e8'] as const;
export const DEFAULT_ACCENT = ACCENTS[0];

export interface AccentSet {
  base: string;
  /** ~14% fill over transparent — pills, soft backgrounds. */
  soft: string;
  /** ~34% — borders/lines on accent surfaces. */
  line: string;
  /** Near-black, accent-tinted text/icon color used on top of `base`. */
  ink: string;
}

/** Derive the accent variants exactly like the prototype's color-mix() did. */
export function accentSet(base: string): AccentSet {
  return {
    base,
    soft: withAlpha(base, 0.14),
    line: withAlpha(base, 0.34),
    ink: mix(base, '#05070b', 0.2),
  };
}

export const fonts = {
  display: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  body: 'Manrope_500Medium',
  bodySemi: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  bodyExtra: 'Manrope_800ExtraBold',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

export const radius = {
  card: 22,
  btn: 16,
  icon: 14,
  field: 14,
  chip: 100,
  sheet: 30,
  fab: 22,
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 22, xxl: 28 } as const;

export const shadow = {
  fab: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
} as const;
