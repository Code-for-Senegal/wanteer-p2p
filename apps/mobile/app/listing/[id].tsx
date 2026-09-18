import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { neighborhoodName } from '@p2p-local/config';
import { colors, fontSize, radius, spacing } from '@p2p-local/design-tokens';
import { useListing } from '@/features/listings/use-listings';
import { canBeContacted } from '@/features/listings/listing-lifecycle';
import {
  buildContactMessage,
  buildShareText,
  buildWhatsAppUrl,
  openWhatsApp,
} from '@/features/contact/whatsapp';
import { useContactProfile } from '@/features/contact/contact-profile';
import { formatAge, formatListingBadge } from '@/lib/format';
import { photoUri } from '@/lib/photos';

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = useListing(id);
  const { profile } = useContactProfile();

  if (listing.isPending) {
    return <ActivityIndicator color={colors.brand[600]} style={styles.loader} />;
  }

  if (!listing.data) {
    return <Text style={styles.missing}>Cette annonce n’existe plus.</Text>;
  }

  const item = listing.data;
  const badge = formatListingBadge(item.type, item.price);
  // Expiry is reconciled by archiveExpired() on launch, so the status is what
  // the screen reads; the clock is checked in the handler, not during render.
  const contactable = item.status === 'ACTIVE';

  async function contact() {
    if (!canBeContacted(item, Date.now())) return;
    // The number is never rendered: it goes straight into the link.
    const message = buildContactMessage({
      firstName: profile?.firstName ?? 'un voisin',
      listingTitle: item.title,
    });
    await openWhatsApp(buildWhatsAppUrl(item.authorPhone, message));
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.photo}>
        {item.photoFileName ? (
          <Image source={{ uri: photoUri(item.photoFileName) }} style={styles.image} />
        ) : null}
      </View>

      <Text style={styles.badge}>{item.status === 'COMPLETED' ? 'Complété' : badge}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>
        {neighborhoodName(item.neighborhoodId)} · {formatAge(item.createdAt)}
      </Text>
      {item.description ? <Text style={styles.description}>{item.description}</Text> : null}

      <Pressable
        style={[styles.primary, !contactable && styles.disabled]}
        onPress={contact}
        disabled={!contactable}
      >
        <Text style={styles.primaryLabel}>
          {contactable ? 'Contacter sur WhatsApp' : 'Annonce clôturée'}
        </Text>
      </Pressable>

      <Text style={styles.safety}>
        L’application ne vous demandera jamais d’acompte ni de code Wave ou Orange Money par
        message.
      </Text>

      <Pressable
        style={styles.secondary}
        onPress={() =>
          Share.share({
            message: buildShareText({
              title: item.title,
              badge,
              neighborhoodName: neighborhoodName(item.neighborhoodId),
            }),
          })
        }
      >
        <Text style={styles.secondaryLabel}>Partager</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing[4], gap: spacing[2], backgroundColor: colors.neutral[0] },
  loader: { marginTop: spacing[10] },
  missing: { margin: spacing[6], color: colors.neutral[500], textAlign: 'center' },
  photo: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  badge: { fontSize: fontSize.sm, fontWeight: '700', color: colors.brand[600], marginTop: spacing[3] },
  title: { fontSize: fontSize.xl, fontWeight: '600', color: colors.neutral[900] },
  meta: { fontSize: fontSize.sm, color: colors.neutral[500] },
  description: { fontSize: fontSize.base, color: colors.neutral[700], marginTop: spacing[2] },
  primary: {
    marginTop: spacing[5],
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
  },
  disabled: { backgroundColor: colors.neutral[300] },
  primaryLabel: { color: colors.neutral[0], fontWeight: '700' },
  safety: { fontSize: fontSize.xs, color: colors.neutral[500], textAlign: 'center' },
  secondary: {
    marginTop: spacing[2],
    padding: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand[600],
    alignItems: 'center',
  },
  secondaryLabel: { color: colors.brand[700], fontWeight: '600' },
});
