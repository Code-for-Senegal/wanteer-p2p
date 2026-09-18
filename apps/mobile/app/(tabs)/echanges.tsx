import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@p2p-local/design-tokens';
import { ListingCard } from '@/components/listing-card';
import {
  useListings,
  useMarkAsCompleted,
  useRemoveListing,
} from '@/features/listings/use-listings';

export default function MyListingsScreen() {
  // Every listing on this device was published from it, so "mine" is the whole
  // document until listings can come from a server.
  const listings = useListings({});
  const complete = useMarkAsCompleted();
  const remove = useRemoveListing();

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={listings.data ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <ListingCard listing={item} />
          <View style={styles.actions}>
            {item.status === 'ACTIVE' ? (
              <Pressable style={styles.action} onPress={() => complete.mutate(item.id)}>
                <Text style={styles.actionLabel}>Marquer comme donné</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={styles.action}
              onPress={() =>
                Alert.alert(
                  'Supprimer cette annonce ?',
                  'Elle sera effacée immédiatement, avec sa photo. Cette action est irréversible.',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Supprimer',
                      style: 'destructive',
                      onPress: () => remove.mutate(item.id),
                    },
                  ],
                )
              }
            >
              <Text style={[styles.actionLabel, styles.danger]}>Supprimer</Text>
            </Pressable>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>Vous n’avez pas encore publié d’annonce.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing[4], gap: spacing[4], backgroundColor: colors.neutral[50] },
  row: { gap: spacing[2] },
  actions: { flexDirection: 'row', gap: spacing[2] },
  action: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[0],
  },
  actionLabel: { fontSize: fontSize.sm, color: colors.neutral[700] },
  danger: { color: colors.danger[500] },
  empty: { color: colors.neutral[500], textAlign: 'center', marginTop: spacing[10] },
});
