import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Contact, ExchangeMethod } from '@/types';

/** Infer the method from a "met" label like "Tap · Rooftop party". */
export function methodFromMet(met: string): ExchangeMethod {
  if (met.startsWith('Tap')) return 'tap';
  if (met.startsWith('Nearby')) return 'nearby';
  return 'qr';
}

type Seed = Omit<Contact, 'id' | 'method' | 'metAt' | 'verified'>;

const SEED: Seed[] = [
  { name: 'Priya Nair', title: 'iOS Engineer', company: 'Lumen', hue: 268, phone: '+1 (212) 555-0117', email: 'priya@lumen.dev', met: 'React Conf · Booth 12', when: 'Today', fav: true, socials: { linkedin: 'priyanair', x: 'priyacodes' } },
  { name: 'Theo Lindqvist', title: 'Sound Designer', company: '', hue: 208, phone: '+46 70 555 21', email: 'theo@audion.se', met: 'Tap · Rooftop party', when: 'Today', fav: false, socials: { instagram: 'theomakesnoise' } },
  { name: 'Aisha Rahman', title: 'VC · Partner', company: 'Foldwell', hue: 338, phone: '+1 (650) 555-0162', email: 'aisha@foldwell.vc', met: 'Nearby · The Mill café', when: 'Yesterday', fav: true, socials: { linkedin: 'aisharahman', x: 'aisha' } },
  { name: 'Kenji Watanabe', title: 'Chef', company: 'Nori + Ash', hue: 18, phone: '+81 90 555 88', email: 'kenji@noriash.jp', met: 'QR · Pop-up dinner', when: 'Mon', fav: false, socials: { instagram: 'noriash' } },
  { name: 'Lena Vogt', title: 'Architect', company: 'Studio Vogt', hue: 128, phone: '+49 30 555 09', email: 'lena@studiovogt.de', met: 'QR · Design Week', when: 'Mar 4', fav: false, socials: { linkedin: 'lenavogt', website: 'studiovogt.de' } },
  { name: 'Marcus Bell', title: 'DJ / Producer', company: '', hue: 298, phone: '+1 (305) 555-0144', email: 'marcus@bell.fm', met: 'Tap · Sundown set', when: 'Mar 1', fav: false, socials: { instagram: 'marcusbell', x: 'marcusbell' } },
  { name: 'Sofia Marchetti', title: 'Journalist', company: 'The Atlas', hue: 88, phone: '+39 06 555 77', email: 'sofia@theatlas.com', met: 'Nearby · Press lounge', when: 'Feb 26', fav: true, socials: { x: 'sofiawrites', linkedin: 'sofiamarchetti' } },
  { name: 'Omar Haddad', title: 'Climber · Guide', company: '', hue: 48, phone: '+1 (801) 555-0190', email: 'omar@sendit.co', met: 'QR · Base camp', when: 'Feb 20', fav: false, socials: { instagram: 'omarsends' } },
];

const seedContacts: Contact[] = SEED.map((c, i) => ({
  ...c,
  id: `seed-${c.name.toLowerCase().replace(/\s+/g, '-')}`,
  method: methodFromMet(c.met),
  metAt: i,
  verified: true,
}));

interface ContactsState {
  contacts: Contact[];
  hydrated: boolean;
  /** Insert/update by id; new contacts go to the top. Returns true if new. */
  addContact: (c: Contact) => boolean;
  removeContact: (id: string) => void;
  toggleFav: (id: string) => void;
}

export const useContacts = create<ContactsState>()(
  persist(
    (set, get) => ({
      contacts: seedContacts,
      hydrated: false,
      addContact: (c) => {
        const isNew = !get().contacts.some((x) => x.id === c.id);
        set((s) => ({ contacts: [c, ...s.contacts.filter((x) => x.id !== c.id)] }));
        return isNew;
      },
      removeContact: (id) => set((s) => ({ contacts: s.contacts.filter((x) => x.id !== id) })),
      toggleFav: (id) =>
        set((s) => ({
          contacts: s.contacts.map((x) => (x.id === id ? { ...x, fav: !x.fav } : x)),
        })),
    }),
    {
      name: 'xchange.contacts.v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _h, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
