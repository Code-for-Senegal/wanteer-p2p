import { Tabs } from 'expo-router';
import { colors } from '@p2p-local/design-tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand[600],
        tabBarInactiveTintColor: colors.neutral[500],
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="echanges" options={{ title: 'Mes annonces' }} />
      <Tabs.Screen name="campagne" options={{ title: 'Campagne' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
