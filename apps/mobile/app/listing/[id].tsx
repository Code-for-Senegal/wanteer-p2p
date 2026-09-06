import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '@wantere/design-tokens';
import { apiPath, request } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import type { ListingSummary } from '@/features/listings/use-listings';

interface ListingDetail extends ListingSummary {
  description: string;
  seller: { id: string; displayName: string };
}

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const listing = useQuery({
    queryKey: ['listing', id],
    queryFn: () => request<ListingDetail>(apiPath(`/listings/${id}`)),
    enabled: Boolean(id),
  });

  if (listing.isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.brand[600]} />
      </View>
    );
  }

  if (listing.isError || !listing.data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>Annonce introuvable.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{listing.data.title}</Text>
      <Text style={styles.price}>{formatPrice(listing.data.price, listing.data.type)}</Text>
      <Text style={styles.muted}>{listing.data.location?.displayName}</Text>
      <Text style={styles.description}>{listing.data.description}</Text>
      <Text style={styles.muted}>Publié par {listing.data.seller.displayName}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing[4], gap: spacing[2] },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.xl, fontWeight: '600', color: colors.neutral[900] },
  price: { fontSize: fontSize.lg, fontWeight: '600', color: colors.brand[600] },
  description: { marginTop: spacing[3], color: colors.neutral[800], lineHeight: 22 },
  muted: { color: colors.neutral[500] },
});
