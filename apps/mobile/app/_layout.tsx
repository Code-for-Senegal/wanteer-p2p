import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from '@/providers/app-providers';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShadowVisible: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="listing/[id]" options={{ title: 'Annonce' }} />
        </Stack>
      </AppProviders>
    </SafeAreaProvider>
  );
}
