import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { SOCIAL_META } from '@/components/Socials';
import { Sym } from '@/components/Sym';
import { useCards, useUpdateCard } from '@/data/cards';
import { useUi } from '@/state/ui';
import { colors, fonts } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import type { Socials } from '@/types';

const SOCIAL_KEYS: [keyof Socials, string][] = [
  ['instagram', 'Instagram'],
  ['linkedin', 'LinkedIn'],
  ['x', 'X'],
];

export default function EditCard() {
  const router = useRouter();
  const accent = useAccent();
  const active = useUi((s) => s.active);
  const { byKind } = useCards();
  const profile = byKind[active];
  const updateCard = useUpdateCard();

  const [f, setF] = useState({ ...profile, socials: { ...profile.socials } });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const setSoc = (k: keyof Socials, v: string) => setF((p) => ({ ...p, socials: { ...p.socials, [k]: v } }));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateCard(active, f);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={{ color: colors.dim, fontFamily: fonts.bodyBold }}>Cancel</Text>
        </Pressable>
        <Text style={{ fontFamily: fonts.display, fontSize: 17, color: colors.text }}>Edit · {f.label}</Text>
        <Pressable onPress={save} hitSlop={8} disabled={!f.name.trim()}>
          <Text style={{ color: accent.base, fontFamily: fonts.bodyBold, opacity: f.name.trim() ? 1 : 0.4 }}>Save</Text>
        </Pressable>
      </View>
      <View style={{ height: 1, backgroundColor: colors.line }} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <View>
              <Avatar name={f.name || 'You'} hue={f.hue} size={86} ring />
              <View style={{ position: 'absolute', right: -2, bottom: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: accent.base, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.s1 }}>
                <Sym name="photo-camera" size={15} color={accent.ink} />
              </View>
            </View>
          </View>

          <Field label="Full name" value={f.name} onChangeText={(v) => set('name', v)} />
          <Field label="What you do" value={f.title} onChangeText={(v) => set('title', v)} placeholder="Photographer, Founder…" />
          <Field label="Company" value={f.company} onChangeText={(v) => set('company', v)} placeholder="Where you work" />
          <Field label="Tagline" value={f.tagline} onChangeText={(v) => set('tagline', v)} />

          <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 8 }} />

          <Field label="Phone" icon="call" value={f.phone} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" />
          <Field label="Email" icon="mail" value={f.email} onChangeText={(v) => set('email', v)} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Website" icon="language" value={f.website} onChangeText={(v) => set('website', v)} autoCapitalize="none" />

          <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.faint, marginLeft: 4, marginTop: 4, marginBottom: 9 }}>
            Socials
          </Text>
          {SOCIAL_KEYS.map(([k, label]) => (
            <Field
              key={k}
              tag={SOCIAL_META[k].tag}
              value={f.socials[k] || ''}
              onChangeText={(v) => setSoc(k, v)}
              placeholder={label}
              autoCapitalize="none"
            />
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
