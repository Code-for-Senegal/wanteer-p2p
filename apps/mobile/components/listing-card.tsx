import { Link } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { colors, fontSize, radius, spacing } from '@p2p-local/design-tokens';
import type { LocalListing } from '@/features/listings/listing.types';
import { formatAge, formatListingBadge } from '@/lib/format';
import { neighborhoodName } from '@p2p-local/config';
import { photoUri } from '@/lib/photos';
import { Icon } from '@/components/icon';

type ListingCardProps = {
  listing: LocalListing;
  variant?: 'row' | 'home';
  presentation?: {
    imageSource?: ImageSourcePropType;
    publisher?: string;
    initials?: string;
    timeLabel?: string;
    actionLabel?: string;
  };
};

const typeLabels = {
  DONATION: 'DON / GRATUIT',
  BARTER: 'TROC',
  REQUEST: 'BESOIN',
  SALE: 'PRIX COÛTANT',
} as const;

const badgeStyles = {
  DONATION: { backgroundColor: '#e5f7ef' },
  BARTER: { backgroundColor: '#eef0ff' },
  REQUEST: { backgroundColor: '#f9dfe0' },
  SALE: { backgroundColor: '#fff0d8' },
} as const;

export function ListingCard({ listing, variant = 'row', presentation }: ListingCardProps) {
  const [isFavorite, setFavorite] = useState(false);
  const isHome = variant === 'home';
  const imageSource =
    presentation?.imageSource ??
    (listing.photoFileName ? { uri: photoUri(listing.photoFileName) } : null);

  return (
    <Link href={{ pathname: '/listing/[id]', params: { id: listing.id } }} asChild>
      <Pressable style={StyleSheet.flatten([styles.card, isHome && styles.homeCard])}>
        <View style={[styles.thumbnail, isHome && styles.homeThumbnail]}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} />
          ) : (
            <Text style={styles.placeholder}>W</Text>
          )}
          {isHome ? (
            <>
              <View style={[styles.badge, badgeStyles[listing.type]]}>
                <Text style={styles.badgeLabel}>{typeLabels[listing.type]}</Text>
              </View>
              <Pressable
                style={styles.favorite}
                accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                onPress={(event) => {
                  event.stopPropagation();
                  setFavorite((value) => !value);
                }}
              >
                <Icon
                  name="heart"
                  size={18}
                  color={isFavorite ? colors.danger[500] : colors.neutral[700]}
                />
              </Pressable>
            </>
          ) : null}
        </View>
        <View style={[styles.body, isHome && styles.homeBody]}>
          <View style={[styles.heading, isHome && styles.homeHeading]}>
            {isHome ? <Icon name="pin" size={13} color="#8b8c87" /> : null}
            <Text numberOfLines={1} style={styles.location}>
              {neighborhoodName(listing.neighborhoodId)}
            </Text>
            {isHome ? (
              <Text style={styles.time}>
                {presentation?.timeLabel ?? formatAge(listing.createdAt)}
              </Text>
            ) : null}
          </View>
          <Text numberOfLines={2} style={[styles.title, isHome && styles.homeTitle]}>
            {listing.title}
          </Text>
          <View style={[styles.footer, isHome && styles.homeFooter]}>
            {isHome && presentation?.publisher ? (
              <View style={styles.publisher}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarLabel}>{presentation.initials}</Text>
                </View>
                <Text style={styles.publisherName}>{presentation.publisher}</Text>
              </View>
            ) : null}
            <Text style={[styles.price, isHome && styles.homePrice]}>
              {presentation?.actionLabel ?? formatListingBadge(listing.type, listing.price)}
            </Text>
          </View>
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
  homeCard: {
    flexDirection: 'column',
    gap: 0,
    padding: 0,
    overflow: 'hidden',
    borderColor: '#d9d9d4',
    borderRadius: 14,
  },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeThumbnail: { width: '100%', height: 172, borderRadius: 0, backgroundColor: '#dfe7dc' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { fontSize: 32, fontWeight: '700', color: colors.primary[300] },
  body: { flex: 1, gap: spacing[1] },
  homeBody: { paddingTop: 12, paddingHorizontal: 14, paddingBottom: 14, gap: 0 },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  homeHeading: { marginTop: 10 },
  title: { fontSize: fontSize.base, fontWeight: '500', color: colors.neutral[900] },
  homeTitle: {
    marginTop: 9,
    marginBottom: 7,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  price: { fontSize: fontSize.base, fontWeight: '600', color: colors.primary[500] },
  homePrice: { fontSize: 11, color: colors.primary[700], fontWeight: '700' },
  location: { flex: 1, fontSize: 11, color: colors.neutral[500], lineHeight: 13 },
  time: { fontSize: 10, color: '#8b8c87' },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  homeFooter: { paddingTop: 11, borderTopWidth: 1, borderTopColor: '#d9d9d4' },
  publisher: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  avatar: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.full,
    backgroundColor: colors.neutral[50],
  },
  avatarLabel: { color: colors.neutral[600], fontSize: 8, fontWeight: '800' },
  publisherName: { color: colors.neutral[600], fontSize: 11 },
  badge: {
    position: 'absolute',
    left: 10,
    top: 10,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 5,
  },
  badgeLabel: { color: '#2a7d50', fontSize: 9, fontWeight: '800' },
  favorite: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d9d9d4',
    borderRadius: radius.full,
    backgroundColor: colors.neutral[0],
  },
});
