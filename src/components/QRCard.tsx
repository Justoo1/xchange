import { ActivityIndicator, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { colors, fonts } from '@/theme';
import { useAccent } from '@/theme/useAccent';

/**
 * A real, scannable QR with a branded mint center chip. `value` is the encoded
 * string (a single-use exchange token link in cloud mode, or a signed card link
 * in local mode). Null while it's being minted.
 */
export function QRCard({ value, size = 224 }: { value: string | null; size?: number }) {
  const accent = useAccent();
  const chip = Math.round(size * 0.2);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {value ? (
        <>
          <QRCode value={value} size={size} backgroundColor="#fff" color={colors.qrInk} ecl="H" />
          <View
            style={{
              position: 'absolute',
              width: chip,
              height: chip,
              borderRadius: chip * 0.32,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                width: chip * 0.66,
                height: chip * 0.66,
                borderRadius: chip * 0.22,
                backgroundColor: accent.base,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontFamily: fonts.displayBold, fontSize: chip * 0.42, color: accent.ink }}>X</Text>
            </View>
          </View>
        </>
      ) : (
        <ActivityIndicator color={colors.qrInk} />
      )}
    </View>
  );
}
