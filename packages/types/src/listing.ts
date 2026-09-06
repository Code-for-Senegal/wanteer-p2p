export const LISTING_TYPES = ['SALE', 'DONATION', 'BARTER', 'REQUEST'] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const LISTING_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'RESERVED',
  'COMPLETED',
  'ARCHIVED',
  'REJECTED',
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const LISTING_CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'] as const;
export type ListingCondition = (typeof LISTING_CONDITIONS)[number];

/** A price is meaningless for donations and barters, and optional for requests. */
export function requiresPrice(type: ListingType): boolean {
  return type === 'SALE';
}
