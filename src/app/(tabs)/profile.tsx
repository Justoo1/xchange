import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { IconBtn } from '@/components/IconBtn';
import { Screen } from '@/components/Screen';
import { Sym, type SymName } from '@/components/Sym';
import { Toggle } from '@/components/Toggle';
import { useCards } from '@/data/cards';
import { roleOf } from '@/lib/format';
import { isConfigured } from '@/lib/supabase';
import { signOut } from '@/state/auth';
import { useProfile } from '@/state/profile';
import { useSettings } from '@/state/settings';
import { useUi } from '@/state/ui';
import { colors, fonts, radius } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import type { ProfileKind } from '@/types';

export default function ProfileScreen() {
  const router = useRouter();
  const accent = useAccent();
  const { byKind: profiles } = useCards();
  const active = useUi((s) => s.active);
  const replayTour = useProfile((s) => s.replayTour);
  const me = profiles[active];
  const privacy = useSettings((s) => s.privacy);
  const setPrivacy = useSettings((s) => s.setPrivacy);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text }}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        {/* me */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.s1, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 18 }}>
          <Avatar name={me.name} hue={me.hue} size={58} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 19, color: colors.text }}>{me.name}</Text>
            <Text style={{ color: accent.base, fontFamily: fonts.bodySemi, fontSize: 13.5 }}>{me.handle}</Text>
          </View>
          <IconBtn icon="edit" size={19} onPress={() => router.push('/edit')} />
        </View>

        <SectionLabel>Your cards</SectionLabel>
        <Card>
          {(Object.keys(profiles) as ProfileKind[]).map((kind, i) => (
            <View key={kind}>
              {i > 0 ? <Divider /> : null}
              <Row
                icon={kind === 'work' ? 'work' : 'person'}
                label={profiles[kind].label}
                sub={roleOf(profiles[kind].title, profiles[kind].company)}
                right={
                  kind === active ? (
                    <View style={{ backgroundColor: accent.soft, borderWidth: 1, borderColor: accent.line, borderRadius: radius.chip, paddingVertical: 5, paddingHorizontal: 11 }}>
                      <Text style={{ color: accent.base, fontFamily: fonts.bodyBold, fontSize: 12 }}>Active</Text>
                    </View>
                  ) : (
                    <Sym name="chevron-right" size={20} color={colors.faint} />
                  )
                }
              />
            </View>
          ))}
          <Divider />
          <Row icon="add" label="New card" sub="Add a context — events, dating, side project" right={<Sym name="chevron-right" size={20} color={colors.faint} />} />
        </Card>

        <SectionLabel>Privacy</SectionLabel>
        <Card>
          <Row icon="shield" label="Approve before sharing phone" right={<Toggle on={privacy.approve} onChange={(v) => setPrivacy('approve', v)} />} />
          <Divider />
          <Row icon="alternate-email" label="Include socials on my card" right={<Toggle on={privacy.socials} onChange={(v) => setPrivacy('socials', v)} />} />
          <Divider />
          <Row icon="sensors" label="Discoverable on Nearby" sub="Let people around you find your card" right={<Toggle on={privacy.presence} onChange={(v) => setPrivacy('presence', v)} />} />
        </Card>

        <SectionLabel>App</SectionLabel>
        <Card>
          <Row icon="palette" label="Appearance" sub="Open Tweaks to change colours & card style" onPress={() => router.push('/tweaks')} right={<Sym name="chevron-right" size={20} color={colors.faint} />} />
          <Divider />
          {isConfigured ? (
            <Row icon="logout" label="Sign out" onPress={signOut} right={<Sym name="chevron-right" size={20} color={colors.faint} />} />
          ) : (
            <Row icon="replay" label="Replay intro tour" onPress={replayTour} right={<Sym name="chevron-right" size={20} color={colors.faint} />} />
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: colors.faint, marginHorizontal: 4, marginTop: 22, marginBottom: 10 }}>
      {children}
    </Text>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <View style={{ backgroundColor: colors.s1, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, overflow: 'hidden' }}>{children}</View>;
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.line }} />;
}

function Row({
  icon,
  label,
  sub,
  right,
  onPress,
}: {
  icon: SymName;
  label: string;
  sub?: string;
  right?: ReactNode;
  onPress?: () => void;
}) {
  const accent = useAccent();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 18, backgroundColor: pressed && onPress ? colors.s2 : 'transparent' })}>
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.s2, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }}>
        <Sym name={icon} size={20} color={accent.base} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text }}>{label}</Text>
        {sub ? <Text style={{ color: colors.faint, fontFamily: fonts.body, fontSize: 12.5, marginTop: 1 }}>{sub}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}
