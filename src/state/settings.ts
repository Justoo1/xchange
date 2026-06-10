import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_ACCENT } from '@/theme';
import type { CardLayout, ExchangeMethod, Privacy, Settings } from '@/types';

interface SettingsState extends Settings {
  hydrated: boolean;
  setAccent: (hex: string) => void;
  setLayout: (l: CardLayout) => void;
  setDefaultMethod: (m: ExchangeMethod) => void;
  setPrivacy: (key: keyof Privacy, value: boolean) => void;
}

const DEFAULTS: Settings = {
  accent: DEFAULT_ACCENT,
  // Default per the user's request to use the gradient card layout.
  cardLayout: 'gradient',
  defaultMethod: 'qr',
  privacy: {
    // Require approval before sharing your phone — on by default for safety.
    approve: true,
    socials: true,
    // Discoverable on Nearby — off by default so you can't be silently harvested.
    presence: false,
  },
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      hydrated: false,
      setAccent: (accent) => set({ accent }),
      setLayout: (cardLayout) => set({ cardLayout }),
      setDefaultMethod: (defaultMethod) => set({ defaultMethod }),
      setPrivacy: (key, value) => set((s) => ({ privacy: { ...s.privacy, [key]: value } })),
    }),
    {
      name: 'xchange.settings.v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _h, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
