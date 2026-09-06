import { useQuery } from '@tanstack/react-query';
import type { Paginated } from '@wantere/types';
import { apiPath, request } from '@/lib/api';

export interface ListingSummary {
  id: string;
  title: string;
  type: string;
  price: number | null;
  currency: string;
  coverUrl: string | null;
  distanceMeters: number | null;
  location: { displayName: string } | null;
}

export interface ListingQuery {
  q?: string;
  categoryId?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export function useListings(query: ListingQuery = {}) {
  return useQuery({
    queryKey: ['listings', query],
    queryFn: () => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== '') {
          params.set(key, String(value));
        }
      }
      const suffix = params.toString();
      return request<Paginated<ListingSummary>>(apiPath(`/listings${suffix ? `?${suffix}` : ''}`));
    },
  });
}
