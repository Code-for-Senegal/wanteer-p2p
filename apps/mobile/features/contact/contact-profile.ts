import { useCallback, useEffect, useState } from 'react';
import { deviceStore, storageKeys } from '@/lib/storage';
import { listingAuthorSchema } from '@/features/listings/listing.schema';
import type { ListingAuthor } from '@/features/listings/listing.types';

/**
 * First name and WhatsApp number, typed once and kept on the device. It is what
 * a listing copies at publication, and what pre-fills a contact message.
 */
export function useContactProfile() {
  const [profile, setProfile] = useState<ListingAuthor | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const raw = await deviceStore.getItem(storageKeys.contactProfile);
      if (cancelled) return;

      if (raw !== null) {
        try {
          const parsed = listingAuthorSchema.safeParse(JSON.parse(raw));
          if (parsed.success) setProfile(parsed.data);
        } catch {
          // A malformed profile is simply asked for again.
        }
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(async (input: { firstName: string; phone: string }) => {
    const author = listingAuthorSchema.parse(input);
    await deviceStore.setItem(storageKeys.contactProfile, JSON.stringify(author));
    setProfile(author);
    return author;
  }, []);

  return { profile, isLoading, save };
}
