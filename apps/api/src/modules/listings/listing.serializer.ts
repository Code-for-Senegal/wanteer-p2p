import type { PublicLocation } from '@wantere/types';

export interface ListingSummary {
  id: string;
  title: string;
  type: string;
  status: string;
  condition: string | null;
  price: number | null;
  currency: string;
  categoryId: string;
  coverUrl: string | null;
  location: PublicLocation | null;
  distanceMeters: number | null;
  publishedAt: string | null;
  createdAt: string;
}

export interface ListingDetail extends ListingSummary {
  description: string;
  viewCount: number;
  media: { id: string; url: string; sortOrder: number }[];
  seller: { id: string; displayName: string; avatarUrl: string | null; memberSince: string };
}
