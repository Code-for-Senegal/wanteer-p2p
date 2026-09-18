import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { SENEGAL_NEIGHBORHOODS } from '@p2p-local/config';
import { colors, fontSize, spacing } from '@p2p-local/design-tokens';
import { useSearchFilters } from '@/stores/search-filters.store';

export default function NeighborhoodScreen() {
  const { neighborhoodId, setNeighborhood } = useSearchFilters();

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={SENEGAL_NEIGHBORHOODS}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => {
            setNeighborhood(item.id);
            router.back();
          }}
          style={styles.row}
        >
          <Text style={[styles.name, item.id === neighborhoodId && styles.selected]}>
            {item.name}
          </Text>
          <Text style={styles.department}>{item.department}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.neutral[0] },
  row: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  name: { fontSize: fontSize.base, color: colors.neutral[900] },
  selected: { color: colors.brand[600], fontWeight: '700' },
  department: { fontSize: fontSize.xs, color: colors.neutral[500] },
});
