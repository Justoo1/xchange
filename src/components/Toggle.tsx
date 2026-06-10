import { Pressable, View } from 'react-native';

import { colors } from '@/theme';
import { useAccent } from '@/theme/useAccent';

/** Pill toggle used for the privacy settings. */
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  const accent = useAccent();
  return (
    <Pressable onPress={() => onChange(!on)} hitSlop={8}>
      <View
        style={{
          width: 46,
          height: 28,
          borderRadius: 100,
          backgroundColor: on ? accent.base : colors.s3,
          justifyContent: 'center',
        }}>
        <View
          style={{
            position: 'absolute',
            top: 3,
            left: on ? 21 : 3,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#fff',
          }}
        />
      </View>
    </Pressable>
  );
}
