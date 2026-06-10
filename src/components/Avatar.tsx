import { Text, View } from 'react-native';

import { initials } from '@/lib/format';
import { hueGradient } from '@/lib/color';
import { colors, fonts } from '@/theme';
import { DIAGONAL, Gradient } from './Gradient';

/** Initials monogram on a hue-based gradient. */
export function Avatar({
  name = '',
  hue = 158,
  size = 48,
  ring = false,
}: {
  name?: string;
  hue?: number;
  size?: number;
  ring?: boolean;
}) {
  return (
    <View
      style={
        ring
          ? {
              borderRadius: size / 2,
              padding: 3,
              backgroundColor: colors.line2,
            }
          : undefined
      }>
      <Gradient
        colors={hueGradient(hue)}
        start={DIAGONAL.start}
        end={DIAGONAL.end}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: ring ? 3 : 0,
          borderColor: colors.bg,
        }}>
        <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: Math.round(size * 0.38) }}>
          {initials(name)}
        </Text>
      </Gradient>
    </View>
  );
}
