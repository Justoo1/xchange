import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, radius } from '@/theme';
import { Sym, type SymName } from './Sym';

interface FieldProps extends TextInputProps {
  label?: string;
  icon?: SymName;
  /** Mono 2-letter tag instead of an icon (for socials). */
  tag?: string;
}

export function Field({ label, icon, tag, style, ...rest }: FieldProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? (
        <Text
          style={{
            fontFamily: fonts.bodyBold,
            fontSize: 12,
            letterSpacing: 0.7,
            textTransform: 'uppercase',
            color: colors.faint,
            marginBottom: 7,
            marginLeft: 4,
          }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.s1,
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: radius.field,
          paddingLeft: icon || tag ? 14 : 0,
        }}>
        {icon ? <Sym name={icon} size={20} color={colors.faint} /> : null}
        {tag ? (
          <Text style={{ fontFamily: fonts.monoBold, fontSize: 12, color: colors.dim, width: 22 }}>
            {tag}
          </Text>
        ) : null}
        <TextInput
          placeholderTextColor={colors.faint}
          style={[
            {
              flex: 1,
              color: colors.text,
              fontFamily: fonts.bodySemi,
              fontSize: 16,
              paddingVertical: 14,
              paddingHorizontal: icon || tag ? 12 : 16,
            },
            style,
          ]}
          {...rest}
        />
      </View>
    </View>
  );
}
