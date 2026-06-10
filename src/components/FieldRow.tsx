import { Text, View } from 'react-native';

import { colors, fonts } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import { Sym, type SymName } from './Sym';

/** Phone / email / website row: accent icon in a rounded box + label + value. */
export function FieldRow({ icon, label, value }: { icon: SymName; label: string; value: string }) {
  const accent = useAccent();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 11 }}>
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: colors.s2,
          borderWidth: 1,
          borderColor: colors.line,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Sym name={icon} size={19} color={accent.base} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            color: colors.faint,
          }}>
          {label}
        </Text>
        <Text
          numberOfLines={1}
          style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text, marginTop: 2 }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function DivLine() {
  return <View style={{ height: 1, backgroundColor: colors.line }} />;
}
