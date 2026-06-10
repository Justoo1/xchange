import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { useAccent } from '@/theme/useAccent';
import { Sym } from './Sym';

/** Animated success disc (pops in on mount). */
export function SuccessCheck({ size = 64 }: { size?: number }) {
  const accent = useAccent();
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
  }, [scale]);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: accent.base,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        transform: [{ scale }],
      }}>
      <Sym name="check" size={size * 0.56} color={accent.ink} />
    </Animated.View>
  );
}
