import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { LISTING_TYPES, type ListingType } from '@p2p-local/types';
import { colors, fontSize, radius, spacing } from '@p2p-local/design-tokens';

const LABELS: Record<ListingType, string> = {
  DONATION: 'Donner',
  BARTER: 'Troquer',
  SALE: 'Prix coûtant',
  REQUEST: 'Besoin',
};

export function TypeFilter({
  value,
  onChange,
}: {
  value: ListingType | null;
  onChange: (type: ListingType | null) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {LISTING_TYPES.map((type) => {
        const selected = value === type;
        return (
          <Pressable
            key={type}
            onPress={() => onChange(selected ? null : type)}
            style={[styles.chip, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{LABELS[type]}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export { LABELS as LISTING_TYPE_LABELS };

const styles = StyleSheet.create({
  row: { gap: spacing[2], paddingVertical: spacing[2] },
  chip: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[0],
  },
  selected: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  label: { fontSize: fontSize.sm, color: colors.neutral[700] },
  selectedLabel: { color: colors.neutral[0], fontWeight: '600' },
});
