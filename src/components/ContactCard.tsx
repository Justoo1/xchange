import { Text, View } from 'react-native';

import { roleOf } from '@/lib/format';
import { hueGradient } from '@/lib/color';
import { colors, fonts, radius } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import type { CardLayout, Socials as SocialsType } from '@/types';
import { Avatar } from './Avatar';
import { DivLine, FieldRow } from './FieldRow';
import { DIAGONAL, Gradient } from './Gradient';
import { Socials } from './Socials';

export interface CardData {
  name: string;
  handle?: string;
  title?: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  socials?: SocialsType;
  hue: number;
  tagline?: string;
}

/** The contact card with three layout variants (Tweaks → Contact Card). */
export function ContactCard({
  card,
  variant = 'minimal',
  showFields = true,
}: {
  card: CardData;
  variant?: CardLayout;
  showFields?: boolean;
}) {
  const accent = useAccent();
  const role = roleOf(card.title, card.company);
  const hasSocials = card.socials && Object.values(card.socials).some(Boolean);

  return (
    <View
      style={{
        backgroundColor: colors.s1,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}>
      {/* Header */}
      {variant === 'gradient' ? (
        <Gradient
          colors={hueGradient(card.hue)}
          start={DIAGONAL.start}
          end={DIAGONAL.end}
          style={{ paddingHorizontal: 22, paddingTop: 26, paddingBottom: 22, gap: 14 }}>
          <Avatar name={card.name} hue={card.hue} size={62} ring />
          <View>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 27, color: '#fff', lineHeight: 30 }}>
              {card.name}
            </Text>
            {role ? (
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontFamily: fonts.bodySemi, marginTop: 5 }}>
                {role}
              </Text>
            ) : null}
          </View>
        </Gradient>
      ) : variant === 'bold' ? (
        <View style={{ paddingHorizontal: 22, paddingTop: 24, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: accent.base }}>
              {card.handle || 'XCHANGE'}
            </Text>
            <Avatar name={card.name} hue={card.hue} size={44} />
          </View>
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 38, lineHeight: 38, color: colors.text, marginTop: 18, letterSpacing: -0.5 }}>
            {card.name}
          </Text>
          {role ? <Text style={{ color: colors.dim, fontFamily: fonts.bodySemi, fontSize: 16, marginTop: 12 }}>{role}</Text> : null}
          {card.tagline ? <Text style={{ color: accent.base, fontFamily: fonts.bodySemi, fontSize: 14, marginTop: 10 }}>{card.tagline}</Text> : null}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 18 }}>
          <Avatar name={card.name} hue={card.hue} size={58} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 23, color: colors.text, lineHeight: 26 }}>{card.name}</Text>
            {role ? <Text style={{ color: colors.dim, fontFamily: fonts.bodySemi, fontSize: 14.5, marginTop: 4 }}>{role}</Text> : null}
            {card.handle ? <Text style={{ color: accent.base, fontFamily: fonts.bodySemi, fontSize: 13.5, marginTop: 3 }}>{card.handle}</Text> : null}
          </View>
        </View>
      )}

      {/* Fields */}
      {showFields ? (
        <View style={{ paddingHorizontal: 22, paddingTop: 6, paddingBottom: 20 }}>
          {variant === 'gradient' && card.tagline ? (
            <Text style={{ color: colors.dim, fontFamily: fonts.bodySemi, fontSize: 14, paddingTop: 12, paddingBottom: 4 }}>
              {card.tagline}
            </Text>
          ) : null}
          {card.phone ? <FieldRow icon="call" label="Phone" value={card.phone} /> : null}
          {card.phone && card.email ? <DivLine /> : null}
          {card.email ? <FieldRow icon="mail" label="Email" value={card.email} /> : null}
          {card.website ? (
            <>
              <DivLine />
              <FieldRow icon="language" label="Website" value={card.website} />
            </>
          ) : null}
          {hasSocials ? (
            <View style={{ marginTop: 16 }}>
              <Socials socials={card.socials!} />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
