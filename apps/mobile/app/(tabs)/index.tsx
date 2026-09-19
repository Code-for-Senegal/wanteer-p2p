import { useRouter } from 'expo-router';
import { useState } from 'react';
import listingBooks1 from '../../assets/listing-books-1.jpg';
import listingBooks2 from '../../assets/listing-books-2.jpg';
import listingStudent from '../../assets/listing-student.jpg';
import listingStudents from '../../assets/listing-students.jpg';
import wantereMark from '../../assets/wantere-mark.png';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@p2p-local/design-tokens';
import type { ListingType } from '@p2p-local/types';
import { Icon, type IconName } from '@/components/icon';
import { ListingCard } from '@/components/listing-card';
import { NeighborhoodSheet } from '@/components/neighborhood-sheet';
import { useListings } from '@/features/listings/use-listings';
import type { LocalListing } from '@/features/listings/listing.types';
import { useSearchFilters } from '@/stores/search-filters.store';

const quickFilters: {
  type: ListingType;
  label: string;
  icon: IconName;
  backgroundColor: string;
}[] = [
  { type: 'DONATION', label: 'Donner', icon: 'tag', backgroundColor: '#d9f3e5' },
  { type: 'BARTER', label: 'Troquer', icon: 'exchange', backgroundColor: '#dbeef7' },
  { type: 'SALE', label: 'Prix coûtant', icon: 'dollar', backgroundColor: '#ffedc9' },
  { type: 'REQUEST', label: 'Besoin', icon: 'search', backgroundColor: '#f9dfe0' },
];

type HomeListing = {
  listing: LocalListing;
  presentation?: {
    imageSource?: ImageSourcePropType;
    publisher?: string;
    initials?: string;
    timeLabel?: string;
    actionLabel?: string;
  };
};

const prototypeListings: HomeListing[] = [
  {
    listing: {
      id: '00000000-0000-4000-8000-000000000001',
      title: 'Manuel Mathématiques 3ème',
      type: 'DONATION',
      price: null,
      ownerKey: 'prototype',
      source: 'device',
      description: '',
      neighborhoodId: 'parcelles-unite-15',
      photoFileName: null,
      authorFirstName: 'Awa',
      authorPhone: '+221000000000',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
    presentation: {
      imageSource: listingBooks1,
      publisher: 'Awa N.',
      initials: 'AN',
      timeLabel: 'il y a 2 h',
      actionLabel: 'Gratuit',
    },
  },
  {
    listing: {
      id: '00000000-0000-4000-8000-000000000002',
      title: 'Manuel de Physique Terminale S',
      type: 'SALE',
      price: 2500,
      ownerKey: 'prototype',
      source: 'device',
      description: '',
      neighborhoodId: 'parcelles-assainies',
      photoFileName: null,
      authorFirstName: 'Oumar',
      authorPhone: '+221000000001',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
    presentation: {
      imageSource: listingStudents,
      publisher: 'Oumar D.',
      initials: 'OD',
      timeLabel: 'il y a 3 h',
      actionLabel: '2 500 FCFA',
    },
  },
  {
    listing: {
      id: '00000000-0000-4000-8000-000000000003',
      title: 'Livre de français 5e',
      type: 'DONATION',
      price: null,
      ownerKey: 'prototype',
      source: 'device',
      description: '',
      neighborhoodId: 'pikine',
      photoFileName: null,
      authorFirstName: 'Fatou',
      authorPhone: '+221000000002',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
    presentation: {
      imageSource: listingBooks2,
      publisher: 'Fatou K.',
      initials: 'FK',
      timeLabel: 'il y a 1 h',
      actionLabel: 'Gratuit',
    },
  },
  {
    listing: {
      id: '00000000-0000-4000-8000-000000000004',
      title: 'Manuel de Sciences',
      type: 'BARTER',
      price: null,
      ownerKey: 'prototype',
      source: 'device',
      description: '',
      neighborhoodId: 'medina',
      photoFileName: null,
      authorFirstName: 'Fatou',
      authorPhone: '+221000000003',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
    presentation: {
      imageSource: listingStudent,
      publisher: 'Fatou K.',
      initials: 'FK',
      timeLabel: 'il y a 5 h',
      actionLabel: 'Proposer troc',
    },
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { query, setQuery, type: selectedType, setType } = useSearchFilters();
  const [neighborhood, setNeighborhood] = useState('Médina');
  const [isNeighborhoodOpen, setNeighborhoodOpen] = useState(false);

  const listings = useListings({
    query,
    type: selectedType,
    neighborhoodId: neighborhood,
  });
  const prototypeMatches = prototypeListings.filter(({ listing }) => {
    const matchesType =
      selectedType === null || selectedType === undefined || listing.type === selectedType;
    const matchesQuery =
      query.length < 2 ||
      listing.title.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr'));
    return matchesType && matchesQuery;
  });
  const displayListings: HomeListing[] = listings.data?.length
    ? listings.data.map((listing) => ({ listing }))
    : __DEV__
      ? prototypeMatches
      : [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: top + spacing[3] }]}>
        <View style={styles.brandLockup}>
          <Image source={wantereMark} style={styles.mark} />
          <Text style={styles.brandName}>wantere</Text>
        </View>
        <Pressable
          accessibilityLabel="Notifications"
          style={[styles.notificationsButton, { top: top + 8 }]}
        >
          <Icon name="bell" size={21} color={colors.neutral[700]} />
        </Pressable>
      </View>

      <FlatList
        data={displayListings}
        keyExtractor={({ listing }) => listing.id}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 106 }]}
        keyboardShouldPersistTaps="handled"
        refreshing={listings.isRefetching}
        onRefresh={() => void listings.refetch()}
        ListHeaderComponent={
          <View>
            <Pressable style={styles.neighborhoodButton} onPress={() => setNeighborhoodOpen(true)}>
              <Icon name="pin" size={15} color={colors.neutral[600]} />
              <Text style={styles.neighborhoodLabel}>Dakar · {neighborhood}</Text>
              <Icon name="chevron-down" size={18} color={colors.neutral[500]} />
            </Pressable>

            <View style={styles.searchField}>
              <Icon name="search" size={15} color={colors.neutral[400]} />
              <TextInput
                style={styles.searchInput}
                placeholder="Chercher une annonce (ex : manuel, table...)"
                placeholderTextColor={colors.neutral[400]}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
              />
            </View>

            <View style={styles.quickFilters}>
              {quickFilters.map((filter) => {
                const selected = selectedType === filter.type;
                return (
                  <Pressable
                    key={filter.type}
                    style={[
                      styles.quickFilter,
                      { backgroundColor: filter.backgroundColor },
                      selected && styles.quickFilterSelected,
                    ]}
                    onPress={() => setType(selected ? null : filter.type)}
                  >
                    {selected ? <View style={styles.quickFilterIndicator} /> : null}
                    <Icon
                      name={filter.icon}
                      size={20}
                      color={selected ? colors.primary[700] : colors.neutral[800]}
                    />
                    <Text
                      style={[styles.quickFilterLabel, selected && styles.quickFilterLabelSelected]}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.heading}>
              <View>
                <Text style={styles.title}>Près de chez vous</Text>
                <Text style={styles.subtitle}>Annonces récentes aux alentours</Text>
              </View>
              <Pressable style={styles.filterButton} onPress={() => router.push('/(tabs)/echanges')}>
                <Icon name="filter" size={13} color={colors.primary[500]} />
                <Text style={styles.filterLabel}>Filtrer</Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ListingCard listing={item.listing} variant="home" presentation={item.presentation} />
        )}
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
        ListEmptyComponent={
          listings.isPending ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={colors.primary[500]} />
            </View>
          ) : (
            <Text style={styles.emptyState}>
              {listings.isError
                ? 'Les annonces sont indisponibles pour le moment.'
                : 'Aucune annonce publiée près de vous.'}
            </Text>
          )
        }
      />

      <NeighborhoodSheet
        visible={isNeighborhoodOpen}
        selected={neighborhood}
        bottomInset={bottom}
        onClose={() => setNeighborhoodOpen(false)}
        onSelect={setNeighborhood}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f6f2' },
  header: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: '#e7e6e2',
  },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { width: 18, height: 24, resizeMode: 'contain' },
  brandName: { color: colors.primary[500], fontSize: 24, fontWeight: '800', letterSpacing: -1 },
  notificationsButton: {
    position: 'absolute',
    right: 18,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: 'transparent',
  },
  content: { paddingHorizontal: 14, paddingTop: 14 },
  neighborhoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 0,
  },
  neighborhoodLabel: {
    flex: 1,
    color: colors.neutral[900],
    fontSize: 12,
    fontWeight: '700',
  },
  searchField: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#eeede9',
  },
  searchInput: { flex: 1, minWidth: 0, color: colors.neutral[900], fontSize: 11 },
  quickFilters: { flexDirection: 'row', gap: 6, marginTop: 12 },
  quickFilter: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 9,
  },
  quickFilterSelected: {
    transform: [{ translateY: -1 }],
  },
  quickFilterIndicator: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary[700],
  },
  quickFilterLabel: {
    color: colors.neutral[800],
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  quickFilterLabelSelected: { color: colors.primary[700] },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 9,
  },
  title: {
    color: colors.neutral[900],
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: { marginTop: 4, color: colors.neutral[500], fontSize: 10 },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  filterLabel: { color: colors.primary[700], fontSize: 10, fontWeight: '700' },
  cardSeparator: { height: 12 },
  emptyState: { marginTop: spacing[10], color: colors.neutral[500], textAlign: 'center' },
});
