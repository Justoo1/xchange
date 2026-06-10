import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Screen } from '@/components/Screen';
import { Sym, type SymName } from '@/components/Sym';
import { useContactList } from '@/data/contacts';
import { colors, fonts, radius } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import type { ExchangeMethod } from '@/types';

const METHOD_ICON: Record<ExchangeMethod, SymName> = { tap: 'contactless', nearby: 'sensors', qr: 'qr-code-2' };

export default function ActivityScreen() {
  const router = useRouter();
  const accent = useAccent();
  const { contacts } = useContactList();

  // group by `when`, preserving order
  const groups: { when: string; list: typeof contacts }[] = [];
  contacts.forEach((c) => {
    const g = groups.find((x) => x.when === c.when);
    if (g) g.list.push(c);
    else groups.push({ when: c.when, list: [c] });
  });

  const stats: [SymName, number, string][] = [
    ['swap-horiz', contacts.length, 'swaps'],
    ['groups', new Set(contacts.map((c) => c.company).filter(Boolean)).size, 'orgs'],
    ['star', contacts.filter((c) => c.fav).length, 'starred'],
  ];

  return (
    <Screen>
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text }}>Activity</Text>
        <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 13, marginTop: 2 }}>Every card you've swapped</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        {/* stat strip */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18, marginTop: 4 }}>
          {stats.map(([icon, n, label]) => (
            <View key={label} style={{ flex: 1, backgroundColor: colors.s1, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, paddingVertical: 14, paddingHorizontal: 12 }}>
              <Sym name={icon} size={19} color={accent.base} />
              <Text style={{ fontFamily: fonts.displayBold, fontSize: 24, color: colors.text, marginTop: 6 }}>{n}</Text>
              <Text style={{ color: colors.faint, fontFamily: fonts.bodySemi, fontSize: 12 }}>{label}</Text>
            </View>
          ))}
        </View>

        {groups.map((g) => (
          <View key={g.when} style={{ marginBottom: 8 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: colors.faint, marginHorizontal: 4, marginTop: 14, marginBottom: 10 }}>
              {g.when}
            </Text>
            <View style={{ paddingLeft: 8 }}>
              {g.list.map((c, i) => (
                <Pressable key={c.id} onPress={() => router.push(`/contact/${c.id}`)} style={{ flexDirection: 'row', gap: 14 }}>
                  <View style={{ alignItems: 'center', width: 28 }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.s2, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }}>
                      <Sym name={METHOD_ICON[c.method]} size={15} color={accent.base} />
                    </View>
                    {i < g.list.length - 1 ? <View style={{ flex: 1, width: 1.5, backgroundColor: colors.line, marginVertical: 2 }} /> : null}
                  </View>
                  <View style={{ flex: 1, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Avatar name={c.name} hue={c.hue} size={40} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text }}>{c.name}</Text>
                      <Text style={{ color: colors.faint, fontFamily: fonts.body, fontSize: 12.5, marginTop: 1 }} numberOfLines={1}>{c.met}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
