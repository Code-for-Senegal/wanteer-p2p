import { Tabs } from 'expo-router';
import { colors } from '@wantere/design-tokens';

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
      <Tabs.Screen name="search" options={{ title: 'Recherche' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favoris' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
