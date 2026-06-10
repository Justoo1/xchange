import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AccentPicker } from '@/components/AccentPicker';
import { ContactCard } from '@/components/ContactCard';
import { IconBtn } from '@/components/IconBtn';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { useCards } from '@/data/cards';
import { useSettings } from '@/state/settings';
import { useUi } from '@/state/ui';
import { colors, fonts } from '@/theme';
import type { CardLayout, ExchangeMethod } from '@/types';

export default function TweaksScreen() {
  const router = useRouter();
  const s = useSettings();
  const active = useUi((st) => st.active);
  const { byKind } = useCards();
  const preview = byKind[active];

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text }}>Tweaks</Text>
        <IconBtn icon="close" size={20} onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginVertical: 12 }}>
          <ContactCard card={preview} variant={s.cardLayout} />
        </View>

        <Section label="Brand">
          <SubLabel>Accent</SubLabel>
          <AccentPicker value={s.accent} onChange={s.setAccent} />
        </Section>

        <Section label="Contact card">
          <SubLabel>Layout</SubLabel>
          <Segmented<CardLayout>
            value={s.cardLayout}
            onChange={s.setLayout}
            options={[
              { key: 'minimal', label: 'Minimal' },
              { key: 'gradient', label: 'Gradient' },
              { key: 'bold', label: 'Bold' },
            ]}
          />
        </Section>

        <Section label="Exchange">
          <SubLabel>Default method</SubLabel>
          <Segmented<ExchangeMethod>
            value={s.defaultMethod}
            onChange={s.setDefaultMethod}
            options={[
              { key: 'qr', label: 'QR' },
              { key: 'tap', label: 'Tap' },
              { key: 'nearby', label: 'Nearby' },
            ]}
          />
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 22, gap: 12 }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: colors.faint }}>{label}</Text>
      {children}
    </View>
  );
}

function SubLabel({ children }: { children: ReactNode }) {
  return <Text style={{ color: colors.dim, fontFamily: fonts.bodySemi, fontSize: 13, marginBottom: -4 }}>{children}</Text>;
}
