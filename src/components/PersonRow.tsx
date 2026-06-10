import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';
import { Avatar } from './Avatar';

/** A list item (Home recent, Contacts, Activity). */
export function PersonRow({
  name,
  sub,
  hue,
  size = 46,
  onPress,
  right,
  badge,
}: {
  name: string;
  sub?: ReactNode;
  hue: number;
  size?: number;
  onPress?: () => void;
  right?: ReactNode;
  /** Optional node shown inline after the name (e.g. a favorite star). */
  badge?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 13,
        paddingHorizontal: 18,
        backgroundColor: pressed && onPress ? colors.s1 : 'transparent',
      })}>
      <Avatar name={name} hue={hue} size={size} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: fonts.bodyBold, fontSize: 15.5, color: colors.text }} numberOfLines={1}>
            {name}
          </Text>
          {badge}
        </View>
        {sub}
      </View>
      {right}
    </Pressable>
  );
}
