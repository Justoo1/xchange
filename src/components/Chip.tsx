import { Pressable, Text, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import { Sym, type SymName } from './Sym';

export function Chip({
  label,
  icon,
  on,
  onPress,
}: {
  label: string;
  icon?: SymName;
  on?: boolean;
  onPress?: () => void;
}) {
  const accent = useAccent();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: radius.chip,
        backgroundColor: on ? accent.soft : colors.s2,
        borderWidth: 1,
        borderColor: on ? accent.line : colors.line,
        opacity: pressed ? 0.8 : 1,
      })}>
      {icon ? <Sym name={icon} size={16} color={on ? accent.base : colors.dim} /> : null}
      <Text style={{ fontFamily: fonts.bodySemi, fontSize: 13.5, color: on ? accent.base : colors.dim }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** A 2-letter mono tag badge (IG / X / IN / ↗). */
export function Tag({ text }: { text: string }) {
  return (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 7,
        backgroundColor: colors.s3,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ fontFamily: fonts.monoBold, fontSize: 10.5, color: colors.text }}>{text}</Text>
    </View>
  );
}
