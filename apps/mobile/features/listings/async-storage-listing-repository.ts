import { deviceStore, storageKeys, type KeyValueStore } from '@/lib/storage';
import { newId } from '@/lib/ids';
import { storedListingsSchema, type DraftListing } from './listing.schema';
import { archiveDue, expiryFor, isVisible } from './listing-lifecycle';
import {
  ListingNotFoundError,
  type ListingPatch,
  type ListingRepository,
} from './listing-repository';
import type { ListingAuthor, ListingFilter, LocalListing } from './listing.types';

function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * One JSON document under one key.
 *
 * A device holds a handful of listings, so a key per listing would be
 * optimisation without a problem to solve. Writes are chained behind a single
 * promise: two taps in a row must not lose one another's result.
 */
export class AsyncStorageListingRepository implements ListingRepository {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly store: KeyValueStore = deviceStore,
    private readonly now: () => number = Date.now,
    private readonly generateId: () => string = newId,
  ) {}

  async list(filter: ListingFilter = {}): Promise<LocalListing[]> {
    const now = this.now();
    const all = await this.read();
    const status = filter.status ?? 'VISIBLE';
    const query = filter.query ? normalise(filter.query.trim()) : '';

    return all
      .filter((listing) => (status === 'VISIBLE' ? isVisible(listing, now) : listing.status === status))
      .filter((listing) => !filter.type || listing.type === filter.type)
      .filter(
        (listing) => !filter.neighborhoodId || listing.neighborhoodId === filter.neighborhoodId,
      )
      .filter((listing) => !query || normalise(listing.title).includes(query))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string): Promise<LocalListing | null> {
    const all = await this.read();
    return all.find((listing) => listing.id === id) ?? null;
  }

  async create(input: DraftListing, author: ListingAuthor): Promise<LocalListing> {
    const createdAt = new Date(this.now()).toISOString();
    const listing: LocalListing = {
      id: this.generateId(),
      ownerKey: this.generateId(),
      source: 'device',
      title: input.title,
      description: input.description,
      type: input.type,
      price: input.price,
      neighborhoodId: input.neighborhoodId,
      photoFileName: input.photoFileName,
      authorFirstName: author.firstName,
      authorPhone: author.phone,
      status: 'ACTIVE',
      createdAt,
      updatedAt: createdAt,
      completedAt: null,
      expiresAt: expiryFor(createdAt),
    };

    await this.write((all) => [listing, ...all]);
    return listing;
  }

  async update(id: string, patch: ListingPatch): Promise<LocalListing> {
    return this.replace(id, (listing) => ({
      ...listing,
      ...patch,
      updatedAt: new Date(this.now()).toISOString(),
    }));
  }

  async markAsCompleted(id: string): Promise<LocalListing> {
    const at = new Date(this.now()).toISOString();
    return this.replace(id, (listing) => ({
      ...listing,
      status: 'COMPLETED',
      completedAt: at,
      updatedAt: at,
    }));
  }

  async remove(id: string): Promise<void> {
    await this.write((all) => all.filter((listing) => listing.id !== id));
  }

  async archiveExpired(): Promise<number> {
    const now = this.now();
    let archived = 0;

    await this.write((all) =>
      all.map((listing) => {
        if (!archiveDue(listing, now)) return listing;
        archived += 1;
        return { ...listing, status: 'ARCHIVED', updatedAt: new Date(now).toISOString() };
      }),
    );

    return archived;
  }

  private async replace(
    id: string,
    change: (listing: LocalListing) => LocalListing,
  ): Promise<LocalListing> {
    let updated: LocalListing | null = null;

    await this.write((all) =>
      all.map((listing) => {
        if (listing.id !== id) return listing;
        updated = change(listing);
        return updated;
      }),
    );

    if (updated === null) throw new ListingNotFoundError(id);
    return updated;
  }

  private async read(): Promise<LocalListing[]> {
    const raw = await this.store.getItem(storageKeys.listings);
    if (raw === null) return [];

    try {
      // A payload written by an older build, or corrupted, must not take the
      // home screen down with it.
      const parsed = storedListingsSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : [];
    } catch {
      return [];
    }
  }

  private write(change: (all: LocalListing[]) => LocalListing[]): Promise<void> {
    const next = this.queue.then(async () => {
      const all = await this.read();
      await this.store.setItem(storageKeys.listings, JSON.stringify(change(all)));
    });

    this.queue = next.catch(() => undefined);
    return next;
  }
}
