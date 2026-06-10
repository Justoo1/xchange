import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ProfileKind } from '@/types';

interface UiState {
  /** Which card (Personal / Work) is currently selected. */
  active: ProfileKind;
  setActive: (kind: ProfileKind) => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      active: 'personal',
      setActive: (active) => set({ active }),
    }),
    { name: 'xchange.ui.v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
