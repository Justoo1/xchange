import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { PersonRow } from '@/components/PersonRow';
import { Screen } from '@/components/Screen';
import { Sym } from '@/components/Sym';
import { roleOf } from '@/lib/format';
import { useContactList } from '@/data/contacts';
import { colors, fonts, radius } from '@/theme';
import { useAccent } from '@/theme/useAccent';

type Filter = 'All' | 'Favorites' | 'Recent';

export default function PeopleScreen() {
  const router = useRouter();
  const accent = useAccent();
  const { contacts } = useContactList();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = useMemo(() => {
    let list = contacts;
    if (filter === 'Favorites') list = list.filter((c) => c.fav);
    if (filter === 'Recent') list = list.slice(0, 6);
    const s = q.trim().toLowerCase();
    if (s) list = list.filter((c) => `${c.name} ${c.company} ${c.met}`.toLowerCase().includes(s));
    return list;
  }, [contacts, filter, q]);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 18, paddingTop: 14, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text }}>Contacts</Text>
          <Text style={{ color: colors.faint, fontFamily: fonts.bodySemi, fontSize: 14 }}>{contacts.length} people</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.s1, borderWidth: 1, borderColor: colors.line, borderRadius: radius.field, paddingHorizontal: 14 }}>
          <Sym name="search" size={20} color={colors.faint} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search people, places…"
            placeholderTextColor={colors.faint}
            style={{ flex: 1, color: colors.text, fontFamily: fonts.bodySemi, fontSize: 16, paddingVertical: 13 }}
            autoCapitalize="none"
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['All', 'Favorites', 'Recent'] as Filter[]).map((t) => (
            <Chip key={t} label={t} on={filter === t} onPress={() => setFilter(t)} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 4, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: colors.s1, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, overflow: 'hidden' }}>
          {filtered.map((c, i) => (
            <View key={c.id}>
              {i > 0 ? <View style={{ height: 1, backgroundColor: colors.line }} /> : null}
              <PersonRow
                name={c.name}
                hue={c.hue}
                onPress={() => router.push(`/contact/${c.id}`)}
                right={<Text style={{ color: colors.faint, fontFamily: fonts.bodySemi, fontSize: 12 }}>{c.when}</Text>}
                badge={c.fav ? <Sym name="star" size={14} color={accent.base} /> : undefined}
                sub={
                  <View style={{ marginTop: 1 }}>
                    <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 13 }} numberOfLines={1}>
                      {roleOf(c.title, c.company)}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
                      <Sym name="place" size={13} color={colors.faint} />
                      <Text style={{ color: colors.faint, fontFamily: fonts.body, fontSize: 12 }} numberOfLines={1}>{c.met}</Text>
                    </View>
                  </View>
                }
              />
            </View>
          ))}
          {filtered.length === 0 ? (
            <Text style={{ padding: 40, textAlign: 'center', color: colors.faint, fontFamily: fonts.body }}>No matches</Text>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
