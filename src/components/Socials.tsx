import { Text, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';
import type { Socials as SocialsType } from '@/types';
import { Tag } from './Chip';

export const SOCIAL_META: Record<string, { tag: string; label: string }> = {
  instagram: { tag: 'IG', label: 'Instagram' },
  x: { tag: 'X', label: 'X' },
  linkedin: { tag: 'IN', label: 'LinkedIn' },
  website: { tag: '↗', label: 'Website' },
};

export function Socials({ socials }: { socials: SocialsType }) {
  const items = Object.entries(socials).filter(([, v]) => v) as [string, string][];
  if (!items.length) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {items.map(([k, v]) => (
        <View
          key={k}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            paddingVertical: 9,
            paddingHorizontal: 14,
            borderRadius: radius.chip,
            backgroundColor: colors.s2,
            borderWidth: 1,
            borderColor: colors.line,
          }}>
          <Tag text={SOCIAL_META[k]?.tag ?? k.slice(0, 2).toUpperCase()} />
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 13.5, color: colors.dim }}>{v}</Text>
        </View>
      ))}
    </View>
  );
}
