import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@wantere/design-tokens';
import { useCategories } from '@/features/categories/use-categories';
import { useListings } from '@/features/listings/use-listings';
import { useSearchFilters } from '@/stores/search-filters.store';
import { ListingCard } from '@/components/listing-card';

export default function SearchScreen() {
  const { query, setQuery, categoryId, setCategory } = useSearchFilters();
  const categories = useCategories();

  const listings = useListings({
    q: query.length >= 2 ? query : undefined,
    categoryId: categoryId ?? undefined,
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Que cherchez-vous ?"
        placeholderTextColor={colors.neutral[400]}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {categories.data?.map((category) => {
          const selected = category.id === categoryId;
          return (
            <Pressable
              key={category.id}
              onPress={() => setCategory(selected ? null : category.id)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        contentContainerStyle={styles.list}
        data={listings.data?.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        ListEmptyComponent={<Text style={styles.empty}>Aucun résultat.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing[4] },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral[0],
  },
  chips: { flexGrow: 0, marginTop: spacing[3] },
  chip: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginRight: spacing[2],
    backgroundColor: colors.neutral[0],
  },
  chipSelected: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  chipLabel: { fontSize: fontSize.sm, color: colors.neutral[700] },
  chipLabelSelected: { color: colors.neutral[0] },
  list: { paddingVertical: spacing[4], gap: spacing[3] },
  empty: { color: colors.neutral[500], textAlign: 'center', marginTop: spacing[8] },
});
