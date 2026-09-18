import type { ListingType } from '@p2p-local/types';

/** The subset of LISTING_STATUSES a device-held listing can be in. */
export type LocalListingStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface LocalListing {
  id: string;
  /**
   * Written at publication. Storage is already private to the device today, so
   * this buys nothing yet; it exists so access control is in the model and in
   * the UI before a server needs it, rather than bolted on afterwards.
   */
  ownerKey: string;
  /** Discriminant: leaves room for listings coming from a server later. */
  source: 'device';
  title: string;
  description: string;
  type: ListingType;
  /** Integer XOF. Required for SALE, absent otherwise. */
  price: number | null;
  neighborhoodId: string;
  /** File name only — never an absolute URI. See lib/photos.ts. */
  photoFileName: string | null;
  authorFirstName: string;
  /** E.164. Never rendered; only used to build a wa.me link. */
  authorPhone: string;
  status: LocalListingStatus;
  createdAt: string;
  updatedAt: string;
  /** Set when the listing is marked as completed; drives the 48 h grace. */
  completedAt: string | null;
  expiresAt: string;
}

export interface ListingAuthor {
  firstName: string;
  phone: string;
}

export interface ListingFilter {
  type?: ListingType | null;
  neighborhoodId?: string | null;
  query?: string;
  /** Defaults to the listings worth showing: ACTIVE and COMPLETED. */
  status?: LocalListingStatus | 'VISIBLE';
}
