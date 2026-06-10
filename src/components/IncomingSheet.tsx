import { Modal, Pressable, Text, View } from 'react-native';

import { methodLabel, roleOf } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import type { IncomingRequest } from '@/data/exchange';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Sym } from './Sym';

/**
 * The sharer's consent gate: "<name> wants to swap cards". No card is released
 * (the server won't expose it) until Approve is tapped.
 */
export function IncomingSheet({
  request,
  onApprove,
  onDecline,
  busy,
}: {
  request: IncomingRequest | null;
  onApprove: () => void;
  onDecline: () => void;
  busy?: boolean;
}) {
  const accent = useAccent();
  if (!request) return null;
  const card = request.requesterCard;
  const name = card.name || 'Someone';
  const role = roleOf(card.title, card.company);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onDecline}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.scrim }} onPress={busy ? undefined : onDecline} />
        <View style={{ backgroundColor: colors.s1, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 22, paddingBottom: 40 }}>
          <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: colors.line2, alignSelf: 'center', marginTop: 10, marginBottom: 16 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', backgroundColor: colors.s2, borderRadius: radius.chip, paddingVertical: 6, paddingHorizontal: 12 }}>
            <Sym name={request.method === 'tap' ? 'contactless' : request.method === 'nearby' ? 'sensors' : 'qr-code-2'} size={14} color={colors.dim} />
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.5, color: colors.dim }}>
              INCOMING {methodLabel(request.method).toUpperCase()}
            </Text>
          </View>

          <View style={{ alignItems: 'center', marginVertical: 18 }}>
            <Avatar name={name} hue={card.hue ?? 200} size={72} ring />
            <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text, marginTop: 12 }}>{name}</Text>
            {role ? <Text style={{ color: colors.dim, fontFamily: fonts.bodySemi, fontSize: 14, marginTop: 2 }}>{role}</Text> : null}
          </View>

          <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 16 }}>
            {name.split(' ')[0]} wants to swap cards. Approve to share your card and save theirs.
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button label="Decline" variant="ghost" onPress={onDecline} disabled={busy} />
            </View>
            <View style={{ flex: 1.4 }}>
              <Button label="Approve" icon="check" onPress={onApprove} loading={busy} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
