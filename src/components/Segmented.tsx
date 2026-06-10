import { Pressable, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

export interface SegOption<T extends string> {
  key: T;
  label: string;
}

/** Plain segmented control (Tweaks → Layout / Default method). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 6,
        backgroundColor: colors.s1,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 16,
        padding: 5,
      }}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={{
              flex: 1,
              borderRadius: 12,
              paddingVertical: 11,
              alignItems: 'center',
              backgroundColor: active ? colors.s3 : 'transparent',
            }}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 13.5,
                color: active ? colors.text : colors.dim,
              }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
