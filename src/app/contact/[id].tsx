import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ContactCard } from '@/components/ContactCard';
import { IconBtn } from '@/components/IconBtn';
import { Screen } from '@/components/Screen';
import { Sym, type SymName } from '@/components/Sym';
import { useContact, useRemoveContact, useToggleFav } from '@/data/contacts';
import { useSettings } from '@/state/settings';
import { colors, fonts, radius } from '@/theme';
import { useAccent } from '@/theme/useAccent';

export default function ContactDetail() {
  const router = useRouter();
  const accent = useAccent();
  const { id } = useLocalSearchParams<{ id: string }>();
  const contact = useContact(id);
  const toggleFav = useToggleFav();
  const removeContact = useRemoveContact();
  const layout = useSettings((s) => s.cardLayout);

  if (!contact) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text style={{ color: colors.text, fontFamily: fonts.bodyBold }}>Contact not found</Text>
          <Button variant="ghost" label="Go back" compact onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const acts: { icon: SymName; label: string; onPress?: () => void }[] = [
    { icon: 'call', label: 'Call', onPress: () => contact.phone && Linking.openURL(`tel:${contact.phone}`) },
    { icon: 'chat-bubble', label: 'Message', onPress: () => contact.phone && Linking.openURL(`sms:${contact.phone}`) },
    { icon: 'download', label: 'To phone' },
    { icon: 'ios-share', label: 'Share' },
  ];

  const confirmDelete = () => {
    Alert.alert('Remove contact', `Remove ${contact.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await removeContact(contact.id); router.back(); } },
    ]);
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>
        <IconBtn icon="chevron-left" onPress={() => router.back()} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <IconBtn icon={contact.fav ? 'star' : 'star-border'} color={contact.fav ? accent.base : colors.text} size={20} onPress={() => toggleFav(contact.id, !contact.fav)} />
          <IconBtn icon="delete-outline" color="#f0494e" size={20} onPress={confirmDelete} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <ContactCard card={contact} variant={layout} />

        {contact.verified ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
            <Sym name="verified-user" size={16} color="#34c07a" />
            <Text style={{ color: '#34c07a', fontFamily: fonts.bodySemi, fontSize: 13 }}>Card integrity verified</Text>
          </View>
        ) : null}

        {contact.met ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <Sym name="schedule" size={18} color={colors.faint} />
            <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 14 }}>
              Met via <Text style={{ color: colors.text, fontFamily: fonts.bodyBold }}>{contact.met}</Text> · {contact.when}
            </Text>
          </View>
        ) : null}

        {contact.note ? (
          <View style={{ flexDirection: 'row', gap: 10, backgroundColor: colors.s1, borderWidth: 1, borderColor: colors.line, borderRadius: radius.btn, padding: 12, marginTop: 12 }}>
            <Sym name="sticky-note-2" size={18} color={colors.faint} />
            <Text style={{ flex: 1, color: colors.dim, fontFamily: fonts.body, fontSize: 14 }}>{contact.note}</Text>
          </View>
        ) : null}

        {/* action grid */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          {acts.map((a) => (
            <Pressable
              key={a.label}
              onPress={a.onPress}
              style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 7, paddingVertical: 13, backgroundColor: colors.s1, borderWidth: 1, borderColor: colors.line, borderRadius: radius.btn, opacity: pressed ? 0.7 : 1 })}>
              <Sym name={a.icon} size={22} color={accent.base} />
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.dim }}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
