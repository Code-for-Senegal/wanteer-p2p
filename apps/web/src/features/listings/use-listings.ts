'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchListings, type ListingQuery } from './api';

export function useListings(query: ListingQuery) {
  return useQuery({
    queryKey: ['listings', query],
    queryFn: () => fetchListings(query),
  });
}
