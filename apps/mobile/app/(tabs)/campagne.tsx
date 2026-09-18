import { ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fontSize, spacing } from '@p2p-local/design-tokens';

/**
 * A campaign is a time-boxed editorial page, never a special code path through
 * the listings. The copy is a placeholder until the team writes the real one.
 */
export default function CampaignScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Campagne</Text>
      <Text style={styles.body}>
        Cette page présentera la campagne en cours : ce qu’elle demande, la période, et les
        quartiers concernés.
      </Text>
      <Text style={styles.body}>Le contenu reste à écrire.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing[6], gap: spacing[3], backgroundColor: colors.neutral[0] },
  title: { fontSize: fontSize.xl, fontWeight: '600', color: colors.neutral[900] },
  body: { fontSize: fontSize.base, color: colors.neutral[600] },
});
