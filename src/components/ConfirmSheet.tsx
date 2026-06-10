import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { methodLabel, roleOf } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import type { Card } from '@/services/exchange';
import type { VerificationResult } from '@/services/payload';
import type { ExchangeMethod } from '@/types';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Chip } from './Chip';
import { DivLine, FieldRow } from './FieldRow';
import { Field } from './Field';
import { SuccessCheck } from './SuccessCheck';
import { Sym } from './Sym';

const PLACES = ['Current location', 'The Mill café', 'Design Week', 'Rooftop party', 'Office'];

export interface Found {
  card: Card;
  method: ExchangeMethod;
  verification: VerificationResult;
}

/**
 * Confirm & Save — the approval + context-capture moment. Nothing is saved until
 * the user taps Save; the verification banner surfaces tamper/expiry from the
 * security layer (services/payload.ts).
 */
export function ConfirmSheet({
  found,
  onCancel,
  onSave,
}: {
  found: Found | null;
  onCancel: () => void;
  onSave: (met: string, note: string) => void;
}) {
  const accent = useAccent();
  const [place, setPlace] = useState('Current location');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  if (!found) return null;
  const { card, method, verification } = found;
  const first = card.name.split(' ')[0];
  const role = roleOf(card.title, card.company);
  const tampered = !verification.verified;
  const stale = verification.verified && !verification.fresh;

  const save = () => {
    const met = place === 'Current location' ? methodLabel(method) : `${methodLabel(method)} · ${place}`;
    setDone(true);
    setTimeout(() => onSave(met, note), 1100);
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCancel}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.scrim }} onPress={done ? undefined : onCancel} />
        <View
          style={{
            backgroundColor: colors.s1,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            borderWidth: 1,
            borderColor: colors.line,
            maxHeight: '92%',
          }}>
          <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: colors.line2, alignSelf: 'center', marginTop: 10, marginBottom: 4 }} />

          {done ? (
            <View style={{ paddingHorizontal: 24, paddingTop: 30, paddingBottom: 46, alignItems: 'center' }}>
              <SuccessCheck size={70} />
              <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.text, marginTop: 18 }}>Saved</Text>
              <Text style={{ color: colors.dim, fontFamily: fonts.body, marginTop: 4 }}>{card.name} is in your contacts.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
              {/* mutual swap badge */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: accent.soft,
                  borderWidth: 1,
                  borderColor: accent.line,
                  borderRadius: 14,
                  paddingVertical: 11,
                  paddingHorizontal: 14,
                  marginBottom: 14,
                }}>
                <Sym name="swap-horiz" size={20} color={accent.base} />
                <Text style={{ flex: 1, fontFamily: fonts.bodySemi, fontSize: 13.5, color: accent.base }}>
                  Cards swapped — {first} got yours too
                </Text>
              </View>

              {/* verification banner */}
              <VerifyBanner tampered={tampered} stale={stale} reason={verification.reason} />

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16, marginBottom: 6 }}>
                <Avatar name={card.name} hue={card.hue} size={58} ring />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text }}>{card.name}</Text>
                  {role ? <Text style={{ color: colors.dim, fontFamily: fonts.bodySemi, fontSize: 14, marginTop: 2 }}>{role}</Text> : null}
                </View>
              </View>

              {(card.phone || card.email) ? (
                <View style={{ backgroundColor: colors.s1, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, paddingHorizontal: 16, paddingVertical: 4, marginTop: 14 }}>
                  {card.phone ? <FieldRow icon="call" label="Phone" value={card.phone} /> : null}
                  {card.phone && card.email ? <DivLine /> : null}
                  {card.email ? <FieldRow icon="mail" label="Email" value={card.email} /> : null}
                </View>
              ) : null}

              {/* where you met */}
              <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: colors.faint, marginTop: 20 }}>
                Where you met
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {PLACES.map((p) => (
                  <Chip key={p} label={p} icon={place === p ? 'place' : undefined} on={place === p} onPress={() => setPlace(p)} />
                ))}
              </View>

              <View style={{ marginTop: 16 }}>
                <Field label="Add a note" value={note} onChangeText={setNote} placeholder="e.g. talks great coffee, intro to Lena" />
              </View>

              <Button label="Save contact" icon="person-add" onPress={save} style={{ marginTop: 8 }} />
              <Button label="Not now" variant="ghost" onPress={onCancel} style={{ marginTop: 10, backgroundColor: 'transparent', borderWidth: 0 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function VerifyBanner({ tampered, stale, reason }: { tampered: boolean; stale: boolean; reason?: string }) {
  const tone = tampered ? colors.dim : stale ? '#e2a33b' : '#34c07a';
  const color = tampered ? '#f0494e' : tone;
  const text = tampered ? reason ?? 'Could not verify this card.' : stale ? reason ?? 'This capture has expired.' : 'Card integrity verified';
  const icon = tampered ? 'gpp-bad' : stale ? 'schedule' : 'verified-user';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 9,
        paddingHorizontal: 12,
        backgroundColor: `${color}1a`,
        borderColor: `${color}40`,
      }}>
      <Sym name={icon as never} size={16} color={color} />
      <Text style={{ flex: 1, fontFamily: fonts.bodySemi, fontSize: 12.5, color }}>{text}</Text>
    </View>
  );
}
