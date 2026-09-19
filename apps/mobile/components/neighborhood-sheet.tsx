import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@p2p-local/design-tokens';

const neighborhoods = ['Médina', 'Plateau', 'Parcelles Assainies', 'Pikine', 'Sacré-Cœur', 'Yoff'];

type NeighborhoodSheetProps = {
  visible: boolean;
  selected: string;
  bottomInset: number;
  onClose: () => void;
  onSelect: (neighborhood: string) => void;
};

export function NeighborhoodSheet({
  visible,
  selected,
  bottomInset,
  onClose,
  onSelect,
}: NeighborhoodSheetProps) {
  const [query, setQuery] = useState('');
  const visibleNeighborhoods = neighborhoods.filter((neighborhood) =>
    neighborhood.toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr')),
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: bottomInset + spacing[4] }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetCopy}>
              <Text style={styles.sheetTitle}>Votre quartier</Text>
              <Text style={styles.sheetDescription}>
                Il sert à calculer les distances. Votre adresse exacte reste privée.
              </Text>
            </View>
            <Pressable onPress={onClose} accessibilityLabel="Fermer">
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.sheetSearch}
            placeholder="Rechercher une localité"
            placeholderTextColor={colors.neutral[400]}
            value={query}
            onChangeText={setQuery}
          />
          <Text style={styles.sheetSection}>DAKAR</Text>
          {visibleNeighborhoods.map((neighborhood) => (
            <Pressable
              key={neighborhood}
              style={styles.neighborhoodOption}
              onPress={() => onSelect(neighborhood)}
            >
              <View style={[styles.radio, selected === neighborhood && styles.radioSelected]} />
              <Text style={styles.optionLabel}>{neighborhood}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.submitButton} onPress={onClose}>
            <Text style={styles.submitLabel}>Enregistrer</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20, 24, 22, 0.35)' },
  sheet: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.neutral[0],
  },
  sheetHandle: {
    width: 36,
    height: 4,
    alignSelf: 'center',
    marginBottom: spacing[4],
    borderRadius: radius.full,
    backgroundColor: colors.neutral[300],
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  sheetCopy: { flex: 1 },
  sheetTitle: { color: colors.neutral[900], fontSize: fontSize.lg, fontWeight: '700' },
  sheetDescription: {
    marginTop: spacing[1],
    color: colors.neutral[500],
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  close: { color: colors.neutral[700], fontSize: 28, lineHeight: 24 },
  sheetSearch: {
    minHeight: 42,
    marginTop: spacing[4],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
    color: colors.neutral[900],
    fontSize: fontSize.sm,
  },
  sheetSection: {
    marginTop: spacing[4],
    marginBottom: spacing[1],
    color: colors.neutral[400],
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  neighborhoodOption: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  radio: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.full,
  },
  radioSelected: { borderWidth: 5, borderColor: colors.primary[500] },
  optionLabel: { color: colors.neutral[800], fontSize: fontSize.sm },
  submitButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[4],
    borderRadius: radius.md,
    backgroundColor: colors.primary[500],
  },
  submitLabel: { color: colors.neutral[0], fontSize: fontSize.sm, fontWeight: '700' },
});
