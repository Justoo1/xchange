import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { ContactCard } from '@/components/ContactCard';
import { Field } from '@/components/Field';
import { IconBtn } from '@/components/IconBtn';
import { Screen } from '@/components/Screen';
import { SOCIAL_META } from '@/components/Socials';
import { SuccessCheck } from '@/components/SuccessCheck';
import { Sym } from '@/components/Sym';
import { Wordmark } from '@/components/Wordmark';
import { useCards, useUpdateCard } from '@/data/cards';
import { isConfigured } from '@/lib/supabase';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import type { Socials } from '@/types';

const STEPS = 4;
const SOCIAL_KEYS: [keyof Socials, string][] = [
  ['instagram', 'Instagram'],
  ['linkedin', 'LinkedIn'],
  ['x', 'X'],
];

export default function Onboarding() {
  const router = useRouter();
  const accent = useAccent();
  const { byKind } = useCards();
  const base = byKind.personal;
  const updateCard = useUpdateCard();
  const completeOnboarding = useProfile((s) => s.completeOnboarding);
  const [busy, setBusy] = useState(false);

  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    name: base.name,
    title: base.title,
    company: base.company,
    handle: base.handle,
    phone: base.phone,
    email: base.email,
    website: base.website,
    socials: { ...base.socials },
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const setSoc = (k: keyof Socials, v: string) => setF((p) => ({ ...p, socials: { ...p.socials, [k]: v } }));

  const finish = async () => {
    setBusy(true);
    try {
      await updateCard('personal', { ...f, hue: base.hue });
      if (!isConfigured) completeOnboarding();
      router.replace('/');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      {/* progress */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 6 }}>
        {step > 0 && step < STEPS - 1 ? (
          <IconBtn icon="arrow-back" ghost onPress={() => setStep((s) => s - 1)} />
        ) : (
          <View style={{ width: 42 }} />
        )}
        <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step ? accent.base : colors.s3 }} />
          ))}
        </View>
        <View style={{ width: 42 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 22, paddingTop: 12 }} keyboardShouldPersistTaps="handled">
          {step === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 }}>
              <View style={{ width: 96, height: 96, borderRadius: 30, backgroundColor: accent.base, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
                <Sym name="qr-code-2" size={52} color={accent.ink} />
              </View>
              <Wordmark size={26} />
              <Text style={{ fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 36, color: colors.text, textAlign: 'center', marginTop: 14, letterSpacing: -0.5 }}>
                One scan,{'\n'}whole identity.
              </Text>
              <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 14, maxWidth: 300 }}>
                Build a card once. Swap numbers, socials and links with anyone — no typing, no "what's your handle?".
              </Text>
            </View>
          ) : null}

          {step === 1 ? (
            <View>
              <Eyebrow>Step 1 · Identity</Eyebrow>
              <Heading>Who are you?</Heading>
              <View style={{ alignItems: 'center', marginBottom: 22 }}>
                <Avatar name={f.name || 'You'} hue={base.hue} size={84} ring />
              </View>
              <Field label="Full name" value={f.name} onChangeText={(v) => set('name', v)} placeholder="Your name" />
              <Field label="What you do" value={f.title} onChangeText={(v) => set('title', v)} placeholder="Photographer, Founder…" />
              <Field label="Company · optional" value={f.company} onChangeText={(v) => set('company', v)} placeholder="Where you work" />
              <Field label="Handle" icon="alternate-email" value={(f.handle || '').replace(/^@/, '')} onChangeText={(v) => set('handle', '@' + v.replace(/^@/, ''))} placeholder="username" autoCapitalize="none" />
            </View>
          ) : null}

          {step === 2 ? (
            <View>
              <Eyebrow>Step 2 · Reach</Eyebrow>
              <Heading>How to reach you</Heading>
              <Field label="Phone" icon="call" value={f.phone} onChangeText={(v) => set('phone', v)} placeholder="+1 …" keyboardType="phone-pad" />
              <Field label="Email" icon="mail" value={f.email} onChangeText={(v) => set('email', v)} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" />
              <Field label="Website" icon="language" value={f.website} onChangeText={(v) => set('website', v)} placeholder="yoursite.com" autoCapitalize="none" />
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.faint, marginLeft: 4, marginVertical: 9 }}>Socials</Text>
              {SOCIAL_KEYS.map(([k, label]) => (
                <Field key={k} tag={SOCIAL_META[k].tag} value={f.socials[k] || ''} onChangeText={(v) => setSoc(k, v)} placeholder={label} autoCapitalize="none" />
              ))}
            </View>
          ) : null}

          {step === 3 ? (
            <View style={{ paddingBottom: 20 }}>
              <View style={{ alignItems: 'center', marginBottom: 18 }}>
                <SuccessCheck size={64} />
                <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.text, marginTop: 14 }}>Your card is ready</Text>
                <Text style={{ color: colors.dim, fontFamily: fonts.body, marginTop: 2 }}>This is what people receive.</Text>
              </View>
              <ContactCard card={{ ...base, ...f }} variant="gradient" />
            </View>
          ) : null}
        </ScrollView>

        {/* footer cta */}
        <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 22 }}>
          {step < STEPS - 1 ? (
            <Button label={step === 0 ? 'Create my card' : 'Continue'} icon="arrow-forward" onPress={() => setStep((s) => Math.min(s + 1, STEPS - 1))} />
          ) : (
            <Button label="Enter XCHANGE" icon="bolt" loading={busy} onPress={finish} disabled={!f.name.trim()} />
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: colors.faint }}>{children}</Text>;
}
function Heading({ children }: { children: string }) {
  return <Text style={{ fontFamily: fonts.display, fontSize: 27, color: colors.text, marginTop: 8, marginBottom: 22, letterSpacing: -0.3 }}>{children}</Text>;
}
