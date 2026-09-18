import { useEffect } from 'react';
import { Link } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { neighborhoodName } from '@p2p-local/config';
import { colors, fontSize, radius, spacing } from '@p2p-local/design-tokens';
import { ListingCard } from '@/components/listing-card';
import { TypeFilter } from '@/components/type-filter';
import { useListings } from '@/features/listings/use-listings';
import { useListingRepository } from '@/features/listings/listing-repository.context';
import { useSearchFilters } from '@/stores/search-filters.store';

export default function HomeScreen() {
  const { query, type, neighborhoodId, setQuery, setType } = useSearchFilters();
  const repository = useListingRepository();
  const listings = useListings({ query, type, neighborhoodId });

  useEffect(() => {
    // Expired and long-completed listings move out of the way on launch.
    void repository.archiveExpired();
  }, [repository]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Link href="/neighborhood" style={styles.neighborhood}>
          {neighborhoodName(neighborhoodId)} ▾
        </Link>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Chercher une annonce"
          placeholderTextColor={colors.neutral[400]}
          style={styles.search}
        />
        <TypeFilter value={type} onChange={setType} />
      </View>

      {listings.isPending ? (
        <ActivityIndicator color={colors.brand[600]} style={styles.loader} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={listings.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard listing={item} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Aucune annonce dans ce quartier pour le moment.{'\n\n'}
              Les annonces sont enregistrées sur cet appareil : celles publiées depuis un autre
              téléphone n’apparaissent pas ici.
            </Text>
          }
        />
      )}

      <Link href="/publish" style={styles.publish}>
        + Publier une annonce
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { paddingHorizontal: spacing[4], paddingTop: spacing[3], gap: spacing[2] },
  neighborhood: { fontSize: fontSize.base, fontWeight: '600', color: colors.brand[700] },
  search: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.neutral[0],
    color: colors.neutral[900],
  },
  loader: { marginTop: spacing[10] },
  list: { padding: spacing[4], gap: spacing[3] },
  empty: {
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: spacing[10],
    fontSize: fontSize.sm,
  },
  publish: {
    margin: spacing[4],
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.brand[600],
    color: colors.neutral[0],
    textAlign: 'center',
    fontWeight: '700',
    overflow: 'hidden',
  },
});
