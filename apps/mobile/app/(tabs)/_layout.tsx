import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ComponentProps } from 'react';
import { colors } from '@p2p-local/design-tokens';
import { Icon, type IconName } from '@/components/icon';

const tabIcons: Record<string, IconName> = {
  index: 'home',
  echanges: 'listings',
  campagne: 'campaign',
  profil: 'profile',
};

const tabLabels: Record<string, string> = {
  index: 'Accueil',
  echanges: 'Mes annonces',
  campagne: 'Campagne',
  profil: 'Profil',
};

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="echanges" options={{ title: 'Mes annonces' }} />
      <Tabs.Screen name="campagne" options={{ title: 'Campagne' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

type TabBarProps =
  NonNullable<ComponentProps<typeof Tabs>['tabBar']> extends (props: infer Props) => unknown
    ? Props
    : never;

function CustomTabBar({ state, navigation, insets }: TabBarProps) {
  const renderTab = (route: (typeof state.routes)[number]) => {
    const isFocused = state.index === state.routes.indexOf(route);
    const color = isFocused ? colors.primary[700] : '#7f837f';
    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
    };

    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        onPress={onPress}
        style={styles.tab}
      >
        <Icon name={tabIcons[route.name] ?? 'home'} size={18} color={color} />
        <Text style={[styles.tabLabel, { color }]}>{tabLabels[route.name]}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        {state.routes.slice(0, 2).map(renderTab)}
        <View style={styles.fabSlot} />
        {state.routes.slice(2).map(renderTab)}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Publier une annonce"
        style={styles.publishButton}
      >
        <Icon name="plus" size={20} color={colors.neutral[0]} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'relative',
    backgroundColor: colors.neutral[0],
  },
  tabBar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 14,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e0dfdb',
    backgroundColor: colors.neutral[0],
  },
  fabSlot: { flex: 1 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabLabel: { fontSize: 9, fontWeight: '600' },
  publishButton: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: -18,
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -25,
    borderRadius: 25,
    backgroundColor: colors.primary[500],
  },
});
