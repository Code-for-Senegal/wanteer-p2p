import type { DraftListing } from './listing.schema';
import type { ListingAuthor, ListingFilter, LocalListing } from './listing.types';

export type ListingPatch = Partial<
  Pick<LocalListing, 'title' | 'description' | 'price' | 'neighborhoodId' | 'photoFileName' | 'status'>
>;

/**
 * The seam between the screens and wherever listings live.
 *
 * Three rules keep it useful the day a server appears:
 *   - every method is asynchronous, even those that need not be, so an HTTP
 *     implementation substitutes without changing a signature;
 *   - filtering happens here, never in a screen, because a filter becomes a
 *     query string once a server answers;
 *   - no screen imports the store. The implementation is injected through a
 *     React context.
 */
export interface ListingRepository {
  list(filter?: ListingFilter): Promise<LocalListing[]>;
  findById(id: string): Promise<LocalListing | null>;
  create(input: DraftListing, author: ListingAuthor): Promise<LocalListing>;
  update(id: string, patch: ListingPatch): Promise<LocalListing>;
  markAsCompleted(id: string): Promise<LocalListing>;
  remove(id: string): Promise<void>;
  /** Moves anything past its date to ARCHIVED. Returns how many moved. */
  archiveExpired(): Promise<number>;
}

export class ListingNotFoundError extends Error {
  constructor(id: string) {
    super(`Listing ${id} not found`);
    this.name = 'ListingNotFoundError';
  }
}
