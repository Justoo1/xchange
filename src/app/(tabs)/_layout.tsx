import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';
import { useContactsRealtime } from '@/data/contacts';

export default function TabsLayout() {
  // Keep the contact list live (mutual swaps arrive from the other device).
  useContactsRealtime();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#0c0e12' } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="people" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
