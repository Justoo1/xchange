import type { Profile, ProfileKind } from '@/types';

export const CARD_KINDS: ProfileKind[] = ['personal', 'work'];

/** An empty card for a kind — used as the base before DB rows are merged on. */
export function defaultCard(kind: ProfileKind): Profile {
  return {
    kind,
    label: kind === 'work' ? 'Work' : 'Personal',
    name: '',
    handle: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    socials: {},
    hue: kind === 'work' ? 210 : 158,
    tagline: '',
  };
}
