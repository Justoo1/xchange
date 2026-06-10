import { Pressable, View } from 'react-native';

import { ACCENTS, accentSet } from '@/theme';
import { Sym } from './Sym';

/** The 5 accent swatches (Tweaks → Brand → Accent). */
export function AccentPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {ACCENTS.map((hex) => {
        const selected = hex.toLowerCase() === value.toLowerCase();
        return (
          <Pressable key={hex} onPress={() => onChange(hex)} style={{ flex: 1 }}>
            <View
              style={{
                aspectRatio: 1,
                borderRadius: 16,
                backgroundColor: hex,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: selected ? 3 : 0,
                borderColor: '#fff',
              }}>
              {selected ? <Sym name="check" size={22} color={accentSet(hex).ink} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
