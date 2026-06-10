import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ContactCard } from '@/components/ContactCard';
import { IconBtn } from '@/components/IconBtn';
import { PersonRow } from '@/components/PersonRow';
import { Screen } from '@/components/Screen';
import { Sym } from '@/components/Sym';
import { Wordmark } from '@/components/Wordmark';
import { useCards } from '@/data/cards';
import { useContactList } from '@/data/contacts';
import { useSettings } from '@/state/settings';
import { useUi } from '@/state/ui';
import { colors, fonts, radius } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import type { ProfileKind } from '@/types';

export default function CardScreen() {
  const router = useRouter();
  const accent = useAccent();
  const active = useUi((s) => s.active);
  const setActive = useUi((s) => s.setActive);
  const { byKind: profiles } = useCards();
  const card = profiles[active];
  const layout = useSettings((s) => s.cardLayout);
  const { contacts } = useContactList();
  const recent = contacts.slice(0, 3);

  return (
    <Screen>
      {/* topbar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 14 }}>
        <View>
          <Wordmark size={19} />
          <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 13, marginTop: 3 }}>Your digital card</Text>
        </View>
        <IconBtn icon="edit" size={20} onPress={() => router.push('/edit')} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        {/* profile switcher */}
        <View style={{ flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: colors.s1, borderWidth: 1, borderColor: colors.line, borderRadius: radius.chip, padding: 4, marginBottom: 16 }}>
          {(Object.keys(profiles) as ProfileKind[]).map((kind) => {
            const on = kind === active;
            return (
              <Pressable
                key={kind}
                onPress={() => setActive(kind)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 18, borderRadius: radius.chip, backgroundColor: on ? accent.base : 'transparent' }}>
                {on ? <Sym name={kind === 'work' ? 'work' : 'person'} size={17} color={accent.ink} /> : null}
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 14, color: on ? accent.ink : colors.dim }}>
                  {profiles[kind].label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ContactCard card={card} variant={layout} />

        {/* primary actions */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button label="Exchange" icon="sync-alt" onPress={() => router.push('/exchange')} style={{ flex: 1 }} />
          <Button variant="ghost" icon="qr-code-2" compact onPress={() => router.push('/exchange?method=qr')} />
        </View>

        {/* recently met */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 10, marginHorizontal: 4 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: colors.faint }}>
            Recently met
          </Text>
          <Pressable onPress={() => router.push('/people')} hitSlop={8}>
            <Text style={{ color: accent.base, fontFamily: fonts.bodyBold, fontSize: 13 }}>See all</Text>
          </Pressable>
        </View>

        <View style={{ backgroundColor: colors.s1, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, overflow: 'hidden' }}>
          {recent.map((c, i) => (
            <View key={c.id}>
              {i > 0 ? <View style={{ height: 1, backgroundColor: colors.line }} /> : null}
              <PersonRow
                name={c.name}
                hue={c.hue}
                size={42}
                onPress={() => router.push(`/contact/${c.id}`)}
                sub={<Text numberOfLines={1} style={{ color: colors.faint, fontFamily: fonts.body, fontSize: 12.5, marginTop: 1 }}>{c.met}</Text>}
                right={<Text style={{ color: colors.faint, fontFamily: fonts.bodySemi, fontSize: 12 }}>{c.when}</Text>}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
