import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import { Avatar } from './Avatar';
import { DIAGONAL, Gradient } from './Gradient';
import { Sym } from './Sym';

const R = 132;

export interface RadarPeer {
  id: string;
  name: string;
  hue: number;
  /** Optional fixed position; otherwise derived from index. */
  angle?: number;
  dist?: number;
  /** Cloud: the peer's claimable token. */
  token?: string;
}

/** AirDrop-style nearby radar: rotating sweep + positioned blips. */
export function Radar({ peers, onConnect }: { peers: RadarPeer[]; onConnect: (peer: RadarPeer) => void }) {
  const accent = useAccent();
  const [connecting, setConnecting] = useState<string | null>(null);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Native driver doesn't loop on react-native-web (the sweep stops after one
    // turn), so drive it on the JS thread on web and natively elsewhere.
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3400,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const tap = (peer: RadarPeer) => {
    if (connecting) return;
    setConnecting(peer.id);
    setTimeout(() => onConnect(peer), 700);
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: R * 2, height: R * 2 }}>
        {[1, 0.66, 0.33].map((s, i) => (
          <View
            key={i}
            style={{ position: 'absolute', left: R - R * s, top: R - R * s, width: R * 2 * s, height: R * 2 * s, borderRadius: R * s, borderWidth: 1, borderColor: colors.line2, opacity: 0.8 - i * 0.15 }}
          />
        ))}

        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'flex-start', transform: [{ rotate }] }}>
          <Gradient colors={[accent.line, 'transparent']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={{ width: 3, height: R, borderRadius: 2 }} />
        </Animated.View>

        <View style={{ position: 'absolute', left: R - 23, top: R - 23, width: 46, height: 46, borderRadius: 23, backgroundColor: accent.base, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: colors.bg, zIndex: 3 }}>
          <Sym name="person-pin-circle" size={26} color={accent.ink} />
        </View>

        {peers.map((p, idx) => {
          const angle = p.angle ?? (idx * 67 + 30) % 360;
          const dist = p.dist ?? 0.4 + ((idx * 0.17) % 0.5);
          const a = ((angle - 90) * Math.PI) / 180;
          const x = R + Math.cos(a) * dist * (R - 26);
          const y = R + Math.sin(a) * dist * (R - 26);
          const sz = connecting === p.id ? 46 : 40;
          return (
            <Pressable key={p.id} onPress={() => tap(p)} style={{ position: 'absolute', left: x - sz / 2, top: y - sz / 2, zIndex: 2 }}>
              <Avatar name={p.name} hue={p.hue} size={sz} ring />
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: 24, alignItems: 'center' }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 19, color: colors.text }}>
          {connecting ? 'Connecting…' : peers.length ? `${peers.length} ${peers.length === 1 ? 'person' : 'people'} nearby` : 'Looking around you…'}
        </Text>
        <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 14, marginTop: 5 }}>
          {connecting ? 'Sending your card' : peers.length ? 'Tap someone to swap cards' : 'Make sure they have Nearby on'}
        </Text>
      </View>
    </View>
  );
}
