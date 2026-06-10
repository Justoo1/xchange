import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius, shadow } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import { Sym, type SymName } from './Sym';

const META: Record<string, { icon: SymName; label: string }> = {
  index: { icon: 'badge', label: 'Card' },
  people: { icon: 'groups', label: 'People' },
  activity: { icon: 'history', label: 'Activity' },
  profile: { icon: 'person', label: 'Profile' },
};
const LEFT = ['index', 'people'];
const RIGHT = ['activity', 'profile'];

interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const accent = useAccent();
  const router = useRouter();
  const byName = Object.fromEntries(state.routes.map((r, i) => [r.name, { route: r, index: i }]));

  const renderTab = (name: string) => {
    const entry = byName[name];
    if (!entry) return null;
    const focused = state.index === entry.index;
    const meta = META[name];
    return (
      <Pressable
        key={name}
        style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 6 }}
        onPress={() => {
          const e = navigation.emit({ type: 'tabPress', target: entry.route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(entry.route.name);
        }}>
        <Sym name={meta.icon} size={25} color={focused ? accent.base : colors.faint} />
        <Text
          style={{
            fontFamily: fonts.bodyBold,
            fontSize: 11,
            color: focused ? colors.text : colors.faint,
          }}>
          {meta.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        backgroundColor: colors.bg,
        borderTopWidth: 1,
        borderTopColor: colors.line,
        paddingHorizontal: 14,
        paddingTop: 6,
        paddingBottom: (insets.bottom || 8) + 2,
      }}>
      {LEFT.map(renderTab)}

      {/* Center Exchange FAB (squircle) */}
      <View style={{ width: 78, alignItems: 'center' }}>
        <Pressable
          onPress={() => router.push('/exchange')}
          style={({ pressed }) => [
            {
              width: 62,
              height: 62,
              borderRadius: radius.fab,
              marginTop: -26,
              backgroundColor: accent.base,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 6,
              borderColor: colors.bg,
              transform: [{ scale: pressed ? 0.92 : 1 }],
            },
            shadow.fab,
          ]}>
          <Sym name="sync-alt" size={28} color={accent.ink} />
        </Pressable>
      </View>

      {RIGHT.map(renderTab)}
    </View>
  );
}
