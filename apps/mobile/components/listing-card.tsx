import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { neighborhoodName } from '@p2p-local/config';
import { colors, fontSize, radius, spacing } from '@p2p-local/design-tokens';
import { formatAge, formatListingBadge } from '@/lib/format';
import { photoUri } from '@/lib/photos';
import type { LocalListing } from '@/features/listings/listing.types';

export function ListingCard({ listing }: { listing: LocalListing }) {
  const completed = listing.status === 'COMPLETED';

  return (
    <Link href={{ pathname: '/listing/[id]', params: { id: listing.id } }} asChild>
      <Pressable style={[styles.card, completed && styles.completed]}>
        <View style={styles.thumbnail}>
          {listing.photoFileName ? (
            <Image source={{ uri: photoUri(listing.photoFileName) }} style={styles.image} />
          ) : null}
        </View>
        <View style={styles.body}>
          <Text numberOfLines={2} style={styles.title}>
            {listing.title}
          </Text>
          <Text style={styles.badge}>
            {completed ? 'Complété' : formatListingBadge(listing.type, listing.price)}
          </Text>
          <Text style={styles.meta}>
            {neighborhoodName(listing.neighborhoodId)} · {formatAge(listing.createdAt)}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing[3],
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[3],
  },
  completed: { opacity: 0.55 },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  body: { flex: 1, gap: spacing[1] },
  title: { fontSize: fontSize.base, fontWeight: '500', color: colors.neutral[900] },
  badge: { fontSize: fontSize.sm, fontWeight: '600', color: colors.brand[600] },
  meta: { fontSize: fontSize.xs, color: colors.neutral[500] },
});
