import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

/** Dark canvas + safe-area wrapper used by every screen. */
export function Screen({
  children,
  edges = ['top'],
  className,
}: {
  children: ReactNode;
  edges?: Edge[];
  className?: string;
}) {
  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView edges={edges} style={{ flex: 1 }}>
        <View className={`flex-1 ${className ?? ''}`}>{children}</View>
      </SafeAreaView>
    </View>
  );
}
