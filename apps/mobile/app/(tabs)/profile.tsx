import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@wantere/design-tokens';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Le compte membre arrive avec l’authentification par SMS.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  text: { color: colors.neutral[500], textAlign: 'center' },
});
