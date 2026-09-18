import { useLocalSearchParams } from 'expo-router';
import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen
      title="Annonce"
      description={`Détail de l'annonce ${id ?? ''}, contact et partage WhatsApp.`}
    />
  );
}
