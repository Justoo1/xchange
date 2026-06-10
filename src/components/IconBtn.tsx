import { Pressable } from 'react-native';

import { colors, radius } from '@/theme';
import { Sym, type SymName } from './Sym';

/** 42×42 rounded icon button (topbar actions). `ghost` removes the surface. */
export function IconBtn({
  icon,
  onPress,
  ghost,
  color,
  size = 22,
}: {
  icon: SymName;
  onPress?: () => void;
  ghost?: boolean;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 42,
        height: 42,
        borderRadius: radius.icon,
        backgroundColor: ghost ? 'transparent' : colors.s1,
        borderWidth: ghost ? 0 : 1,
        borderColor: colors.line,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.93 : 1 }],
      })}>
      <Sym name={icon} size={size} color={color ?? colors.text} />
    </Pressable>
  );
}
