import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { colors, fontSize, radius, spacing } from '@p2p-local/design-tokens';
import { useContactProfile } from '@/features/contact/contact-profile';

export default function ProfileScreen() {
  const { profile, isLoading, save } = useContactProfile();
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (profile !== null) {
      setFirstName(profile.firstName);
      setPhone(profile.phone);
    }
  }, [profile]);

  async function submit() {
    try {
      await save({ firstName, phone });
      Alert.alert('Enregistré', 'Vos coordonnées sont gardées sur cet appareil.');
    } catch {
      Alert.alert('Coordonnées invalides', 'Vérifiez le prénom et le numéro (ex. 77 123 45 67).');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.label}>Prénom</Text>
      <TextInput value={firstName} onChangeText={setFirstName} style={styles.input} />

      <Text style={styles.label}>Numéro WhatsApp</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="77 123 45 67"
        placeholderTextColor={colors.neutral[400]}
        style={styles.input}
      />

      <Text style={styles.note}>
        Votre numéro n’est jamais affiché dans une annonce ni dans un message partagé. Il sert
        uniquement à ouvrir WhatsApp quand quelqu’un vous contacte.
      </Text>

      <Pressable style={styles.primary} onPress={submit} disabled={isLoading}>
        <Text style={styles.primaryLabel}>Enregistrer</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing[4], gap: spacing[2], backgroundColor: colors.neutral[0] },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.neutral[700], marginTop: spacing[3] },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    padding: spacing[3],
    color: colors.neutral[900],
  },
  note: { fontSize: fontSize.xs, color: colors.neutral[500], marginTop: spacing[3] },
  primary: {
    marginTop: spacing[5],
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
  },
  primaryLabel: { color: colors.neutral[0], fontWeight: '700' },
});
