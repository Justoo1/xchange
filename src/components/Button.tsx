import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';

import { colors, fonts, radius } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import { Sym, type SymName } from './Sym';

type Variant = 'primary' | 'ghost';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label?: string;
  icon?: SymName;
  iconFill?: boolean;
  variant?: Variant;
  loading?: boolean;
  /** Shrinks to content width instead of full-width. */
  compact?: boolean;
  style?: object;
}

export function Button({
  label,
  icon,
  variant = 'primary',
  loading,
  disabled,
  compact,
  style,
  ...rest
}: ButtonProps) {
  const accent = useAccent();
  const primary = variant === 'primary';
  const bg = primary ? accent.base : colors.s2;
  const fg = primary ? accent.ink : colors.text;

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: radius.btn,
          paddingVertical: 16,
          paddingHorizontal: label ? 20 : 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          borderWidth: primary ? 0 : 1,
          borderColor: colors.line,
          width: compact ? undefined : '100%',
          opacity: disabled ? 0.45 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
      android_ripple={{ color: '#ffffff20' }}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {icon ? <Sym name={icon} size={21} color={fg} /> : null}
          {label ? (
            <Text style={{ color: fg, fontFamily: fonts.bodyBold, fontSize: 16 }}>{label}</Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
