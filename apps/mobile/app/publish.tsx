import { useState } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SENEGAL_NEIGHBORHOODS, DEFAULT_NEIGHBORHOOD_ID } from '@p2p-local/config';
import { colors, fontSize, radius, spacing } from '@p2p-local/design-tokens';
import { requiresPrice, type ListingType } from '@p2p-local/types';
import { LISTING_TYPE_LABELS, TypeFilter } from '@/components/type-filter';
import { draftListingSchema } from '@/features/listings/listing.schema';
import { usePublishListing } from '@/features/listings/use-listings';
import { useContactProfile } from '@/features/contact/contact-profile';
import { photoUri, pickPhotoFromLibrary, takePhoto } from '@/lib/photos';

export default function PublishScreen() {
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [type, setType] = useState<ListingType | null>('DONATION');
  const [neighborhoodId, setNeighborhoodId] = useState(DEFAULT_NEIGHBORHOOD_ID);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const publish = usePublishListing();
  const { profile } = useContactProfile();

  async function submit() {
    if (profile === null) {
      Alert.alert(
        'Votre numéro WhatsApp',
        'Renseignez votre prénom et votre numéro dans l’onglet Profil : ils servent à vous joindre, et ne sont jamais affichés sur vos annonces.',
      );
      return;
    }

    const parsed = draftListingSchema.safeParse({
      title,
      description,
      type,
      price: type !== null && requiresPrice(type) ? Number(price.replace(/\D/g, '')) : null,
      neighborhoodId,
      photoFileName,
    });

    if (!parsed.success) {
      Alert.alert('Annonce incomplète', parsed.error.issues[0]?.message ?? 'Vérifiez les champs.');
      return;
    }

    await publish.mutateAsync({ draft: parsed.data, author: profile });
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.form}>
      <Text style={styles.label}>Photo</Text>
      <View style={styles.photoRow}>
        {photoFileName ? (
          <Image source={{ uri: photoUri(photoFileName) }} style={styles.photo} />
        ) : null}
        <Pressable
          style={styles.secondary}
          onPress={async () => setPhotoFileName((await takePhoto()) ?? photoFileName)}
        >
          <Text style={styles.secondaryLabel}>Prendre une photo</Text>
        </Pressable>
        <Pressable
          style={styles.secondary}
          onPress={async () => setPhotoFileName((await pickPhotoFromLibrary()) ?? photoFileName)}
        >
          <Text style={styles.secondaryLabel}>Choisir dans la galerie</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Type</Text>
      <TypeFilter value={type} onChange={setType} />

      <Text style={styles.label}>Quartier</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {SENEGAL_NEIGHBORHOODS.map((neighborhood) => (
          <Pressable
            key={neighborhood.id}
            onPress={() => setNeighborhoodId(neighborhood.id)}
            style={[styles.chip, neighborhood.id === neighborhoodId && styles.chipSelected]}
          >
            <Text
              style={[
                styles.chipLabel,
                neighborhood.id === neighborhoodId && styles.chipLabelSelected,
              ]}
            >
              {neighborhood.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.label}>Titre</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} />

      {type !== null && requiresPrice(type) ? (
        <>
          <Text style={styles.label}>Prix coûtant (FCFA)</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="number-pad"
            style={styles.input}
          />
        </>
      ) : null}

      <Text style={styles.label}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        style={[styles.input, styles.multiline]}
      />

      <Pressable style={styles.primary} onPress={submit} disabled={publish.isPending}>
        <Text style={styles.primaryLabel}>
          {publish.isPending ? 'Publication…' : `Publier — ${type ? LISTING_TYPE_LABELS[type] : ''}`}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: { padding: spacing[4], gap: spacing[2], backgroundColor: colors.neutral[0] },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.neutral[700], marginTop: spacing[3] },
  photoRow: { gap: spacing[2] },
  photo: { width: '100%', height: 180, borderRadius: radius.md, backgroundColor: colors.neutral[100] },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    padding: spacing[3],
    color: colors.neutral[900],
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  chips: { gap: spacing[2], paddingVertical: spacing[2] },
  chip: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  chipSelected: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  chipLabel: { fontSize: fontSize.sm, color: colors.neutral[700] },
  chipLabelSelected: { color: colors.neutral[0], fontWeight: '600' },
  secondary: {
    borderWidth: 1,
    borderColor: colors.brand[600],
    borderRadius: radius.md,
    padding: spacing[3],
    alignItems: 'center',
  },
  secondaryLabel: { color: colors.brand[700], fontWeight: '600' },
  primary: {
    marginTop: spacing[6],
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
  },
  primaryLabel: { color: colors.neutral[0], fontWeight: '700' },
});
