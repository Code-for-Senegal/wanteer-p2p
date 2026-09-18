import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '@p2p-local/design-tokens';

/**
 * Every screen of the shell renders through this until the data layer lands.
 * It exists so the navigation can be walked and reviewed on a device without
 * pretending that a feature is already there.
 */
export function PlaceholderScreen({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    padding: spacing[6],
    backgroundColor: colors.neutral[0],
  },
  title: { fontSize: fontSize.lg, fontWeight: '600', color: colors.neutral[900] },
  description: { fontSize: fontSize.sm, color: colors.neutral[500], textAlign: 'center' },
});
