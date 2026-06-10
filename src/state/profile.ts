import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Profile, ProfileKind } from '@/types';

/** Seed cards (Mara Okafor) used in local mode. */
const SEED: Record<ProfileKind, Profile> = {
  personal: {
    kind: 'personal',
    label: 'Personal',
    name: 'Mara Okafor',
    handle: '@mara',
    title: 'Photographer · Traveler',
    company: '',
    phone: '+1 (415) 555-0148',
    email: 'mara@hey.com',
    website: 'maraokafor.com',
    socials: { instagram: 'mara.shoots', x: 'maraok' },
    hue: 158,
    tagline: 'Catch me at golden hour.',
  },
  work: {
    kind: 'work',
    label: 'Work',
    name: 'Mara Okafor',
    handle: '@maraokafor',
    title: 'Product Designer',
    company: 'Northbeam Studio',
    phone: '+1 (415) 555-0148',
    email: 'mara@northbeam.studio',
    website: 'northbeam.studio',
    socials: { linkedin: 'maraokafor', x: 'maraok' },
    hue: 158,
    tagline: 'Designing calm software.',
  },
};

interface ProfileState {
  profiles: Record<ProfileKind, Profile>;
  onboarded: boolean;
  hydrated: boolean;
  updateProfile: (kind: ProfileKind, patch: Partial<Profile>) => void;
  completeOnboarding: () => void;
  replayTour: () => void;
}

/** Local-mode (no backend) card store, seeded with Mara's cards. */
export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      profiles: SEED,
      onboarded: false,
      hydrated: false,
      updateProfile: (kind, patch) =>
        set((s) => ({
          profiles: { ...s.profiles, [kind]: { ...s.profiles[kind], ...patch, kind } },
        })),
      completeOnboarding: () => set({ onboarded: true }),
      replayTour: () => set({ onboarded: false }),
    }),
    {
      name: 'xchange.profile.v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _h, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
