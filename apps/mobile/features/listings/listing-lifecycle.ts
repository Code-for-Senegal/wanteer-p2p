import { COMPLETED_LISTING_GRACE_HOURS, LISTING_TTL_DAYS } from '@p2p-local/config';
import type { LocalListing } from './listing.types';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export function expiryFor(createdAt: string): string {
  return new Date(new Date(createdAt).getTime() + LISTING_TTL_DAYS * DAY).toISOString();
}

/**
 * A completed listing stays visible, greyed out, for a couple of days: showing
 * what the neighbourhood actually passed on is part of the product, not noise.
 */
export function isWithinCompletedGrace(listing: LocalListing, now: number): boolean {
  if (listing.completedAt === null) return false;
  return now - new Date(listing.completedAt).getTime() < COMPLETED_LISTING_GRACE_HOURS * HOUR;
}

/** Listings nobody should see any more, without deleting anything. */
export function archiveDue(listing: LocalListing, now: number): boolean {
  if (listing.status === 'ARCHIVED') return false;
  if (listing.status === 'COMPLETED') return !isWithinCompletedGrace(listing, now);
  return new Date(listing.expiresAt).getTime() <= now;
}

export function isVisible(listing: LocalListing, now: number): boolean {
  if (listing.status === 'ARCHIVED') return false;
  if (listing.status === 'COMPLETED') return isWithinCompletedGrace(listing, now);
  return new Date(listing.expiresAt).getTime() > now;
}

/** A completed listing can no longer be contacted. */
export function canBeContacted(listing: LocalListing, now: number): boolean {
  return listing.status === 'ACTIVE' && isVisible(listing, now);
}
