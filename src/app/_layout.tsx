import '../global.css';

import { Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useHasCard } from '@/data/cards';
import { DataProvider } from '@/data/query';
import { isConfigured } from '@/lib/supabase';
import { useAuth } from '@/state/auth';
import { useContacts } from '@/state/contacts';
import { useProfile } from '@/state/profile';
import { useSettings } from '@/state/settings';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Auth + onboarding routing. */
function useRouteGuard(ready: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const session = useAuth((s) => s.session);
  const { has } = useHasCard();

  useEffect(() => {
    if (!ready) return;
    const root = segments[0] as string | undefined;
    const inAuth = root === '(auth)';
    const inOnboarding = root === 'onboarding';

    if (isConfigured && !session) {
      if (!inAuth) router.replace('/(auth)/sign-in');
      return;
    }
    if (!has && !inOnboarding) {
      router.replace('/onboarding');
    } else if (has && (inAuth || inOnboarding)) {
      router.replace('/');
    }
  }, [ready, has, session, segments, router]);
}

function RootNavigator() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });
  const authReady = useAuth((s) => s.ready);
  const settingsHydrated = useSettings((s) => s.hydrated);
  const profileHydrated = useProfile((s) => s.hydrated);
  const contactsHydrated = useContacts((s) => s.hydrated);
  const { ready: cardReady } = useHasCard();

  const ready = fontsLoaded && authReady && settingsHydrated && profileHydrated && contactsHydrated && cardReady;

  useRouteGuard(ready);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="exchange" options={{ presentation: 'modal' }} />
      <Stack.Screen name="tweaks" options={{ presentation: 'modal' }} />
      <Stack.Screen name="edit" options={{ presentation: 'modal' }} />
      <Stack.Screen name="contact/[id]" options={{ presentation: 'card' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <DataProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </DataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
