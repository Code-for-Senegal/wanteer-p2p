'use client';

import { useQuery } from '@tanstack/react-query';
import { apiPath, request } from '@/lib/api';
import type { ListingSummary } from './api';

export interface ListingDetail extends ListingSummary {
  description: string;
  viewCount: number;
  media: { id: string; url: string; sortOrder: number }[];
  seller: { id: string; displayName: string; avatarUrl: string | null; memberSince: string };
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => request<ListingDetail>(apiPath(`/listings/${id}`)),
    enabled: Boolean(id),
  });
}
