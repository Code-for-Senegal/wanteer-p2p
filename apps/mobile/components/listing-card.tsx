import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@wantere/design-tokens';
import { formatPrice } from '@/lib/format';
import type { ListingSummary } from '@/features/listings/use-listings';

export function ListingCard({ listing }: { listing: ListingSummary }) {
  return (
    <Link href={{ pathname: '/listing/[id]', params: { id: listing.id } }} asChild>
      <Pressable style={styles.card}>
        <View style={styles.thumbnail}>
          {listing.coverUrl ? (
            <Image source={{ uri: listing.coverUrl }} style={styles.image} />
          ) : null}
        </View>
        <View style={styles.body}>
          <Text numberOfLines={2} style={styles.title}>
            {listing.title}
          </Text>
          <Text style={styles.price}>{formatPrice(listing.price, listing.type)}</Text>
          {listing.location ? (
            <Text style={styles.location}>{listing.location.displayName}</Text>
          ) : null}
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
  price: { fontSize: fontSize.base, fontWeight: '600', color: colors.brand[600] },
  location: { fontSize: fontSize.xs, color: colors.neutral[500] },
});
