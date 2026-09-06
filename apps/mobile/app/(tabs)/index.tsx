import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@wantere/design-tokens';
import { useListings } from '@/features/listings/use-listings';
import { ListingCard } from '@/components/listing-card';

export default function HomeScreen() {
  const listings = useListings();

  if (listings.isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.brand[600]} />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={listings.data?.items ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ListingCard listing={item} />}
      ListEmptyComponent={
        <Text style={styles.empty}>
          {listings.isError
            ? 'Les annonces sont indisponibles pour le moment.'
            : 'Aucune annonce publiée près de vous.'}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing[4], gap: spacing[3] },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: colors.neutral[500], textAlign: 'center', marginTop: spacing[10] },
});
