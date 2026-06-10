import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { Sym } from '@/components/Sym';
import { Wordmark } from '@/components/Wordmark';
import { requireSupabase } from '@/lib/supabase';
import { colors, fonts } from '@/theme';
import { useAccent } from '@/theme/useAccent';

type Mode = 'password' | 'code';

export default function SignIn() {
  const accent = useAccent();
  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = () =>
    run(async () => {
      const sb = requireSupabase();
      if (creating) {
        const { error: e } = await sb.auth.signUp({ email: email.trim(), password });
        if (e) throw e;
        setInfo('Account created. If email confirmation is on, check your inbox, then sign in.');
        setCreating(false);
      } else {
        const { error: e } = await sb.auth.signInWithPassword({ email: email.trim(), password });
        if (e) throw e;
      }
    });

  const sendCode = () =>
    run(async () => {
      const { error: e } = await requireSupabase().auth.signInWithOtp({ email: email.trim() });
      if (e) throw e;
      setCodeSent(true);
      setInfo('We sent a 6-digit code to your email.');
    });

  const verifyCode = () =>
    run(async () => {
      const { error: e } = await requireSupabase().auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email',
      });
      if (e) throw e;
    });

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
          {/* hero */}
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <View style={{ width: 84, height: 84, borderRadius: 26, backgroundColor: accent.base, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <Sym name="sync-alt" size={42} color={accent.ink} />
            </View>
            <Wordmark size={26} />
            <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 15, marginTop: 8, textAlign: 'center' }}>
              Sign in to sync your cards and contacts.
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Segmented<Mode>
              value={mode}
              onChange={(m) => { setMode(m); setError(null); setInfo(null); }}
              options={[
                { key: 'password', label: 'Password' },
                { key: 'code', label: 'Email code' },
              ]}
            />
          </View>

          <Field label="Email" icon="mail" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />

          {mode === 'password' ? (
            <>
              <Field label="Password" icon="lock" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
              <Button label={creating ? 'Create account' : 'Sign in'} icon="arrow-forward" loading={busy} onPress={submitPassword} disabled={!email || !password} />
              <Pressable onPress={() => { setCreating((c) => !c); setError(null); setInfo(null); }} style={{ marginTop: 14, alignSelf: 'center' }}>
                <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 14 }}>
                  {creating ? 'Have an account? ' : 'New here? '}
                  <Text style={{ color: accent.base, fontFamily: fonts.bodyBold }}>{creating ? 'Sign in' : 'Create account'}</Text>
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              {codeSent ? (
                <Field label="6-digit code" icon="password" value={code} onChangeText={setCode} placeholder="123456" keyboardType="number-pad" maxLength={6} />
              ) : null}
              {codeSent ? (
                <Button label="Verify & sign in" icon="check" loading={busy} onPress={verifyCode} disabled={code.length < 6} />
              ) : (
                <Button label="Email me a code" icon="send" loading={busy} onPress={sendCode} disabled={!email} />
              )}
              {codeSent ? (
                <Pressable onPress={sendCode} style={{ marginTop: 14, alignSelf: 'center' }}>
                  <Text style={{ color: accent.base, fontFamily: fonts.bodyBold, fontSize: 14 }}>Resend code</Text>
                </Pressable>
              ) : null}
            </>
          )}

          {error ? <Banner tone="error" text={error} /> : null}
          {info ? <Banner tone="info" text={info} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Banner({ tone, text }: { tone: 'error' | 'info'; text: string }) {
  const color = tone === 'error' ? '#f0494e' : '#34c07a';
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: `${color}1a`, borderWidth: 1, borderColor: `${color}40` }}>
      <Sym name={tone === 'error' ? 'error-outline' : 'check-circle' as never} size={16} color={color} />
      <Text style={{ flex: 1, color, fontFamily: fonts.bodySemi, fontSize: 13 }}>{text}</Text>
    </View>
  );
}
