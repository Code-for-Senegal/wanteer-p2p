import { apiPath, request } from '@/lib/api';
import type { Paginated } from '@wantere/types';

export interface ListingSummary {
  id: string;
  title: string;
  type: string;
  status: string;
  price: number | null;
  currency: string;
  coverUrl: string | null;
  distanceMeters: number | null;
  location: { displayName: string } | null;
  publishedAt: string | null;
}

export interface ListingQuery {
  q?: string;
  categoryId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

export function fetchListings(query: ListingQuery): Promise<Paginated<ListingSummary>> {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  return request<Paginated<ListingSummary>>(apiPath(`/listings${suffix}`));
}
