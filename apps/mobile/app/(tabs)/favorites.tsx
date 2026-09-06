import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@wantere/design-tokens';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Connectez-vous pour retrouver vos annonces favorites.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  text: { color: colors.neutral[500], textAlign: 'center' },
});
