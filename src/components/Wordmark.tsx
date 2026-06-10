import { Text } from 'react-native';

import { colors, fonts } from '@/theme';
import { useAccent } from '@/theme/useAccent';

/** XCHANG + accent-colored E. */
export function Wordmark({ size = 20 }: { size?: number }) {
  const accent = useAccent();
  return (
    <Text style={{ fontFamily: fonts.displayBold, fontSize: size, letterSpacing: 0.4, color: colors.text }}>
      XCHANG<Text style={{ color: accent.base }}>E</Text>
    </Text>
  );
}
