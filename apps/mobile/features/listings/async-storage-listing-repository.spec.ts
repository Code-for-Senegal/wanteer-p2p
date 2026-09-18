import { createMemoryStore, storageKeys } from '@/lib/storage';
import { AsyncStorageListingRepository } from './async-storage-listing-repository';
import { ListingNotFoundError } from './listing-repository';
import type { DraftListing } from './listing.schema';

const NOW = new Date('2026-09-18T12:00:00.000Z').getTime();

const author = { firstName: 'Moussa', phone: '+221771234567' };

const draft: DraftListing = {
  title: 'Manuel de maths 3e',
  description: 'En bon état',
  type: 'DONATION',
  price: null,
  neighborhoodId: 'medina',
  photoFileName: null,
};

function repository(initial: Record<string, string> = {}) {
  let counter = 0;
  return new AsyncStorageListingRepository(
    createMemoryStore(initial),
    () => NOW,
    () => `id-${++counter}`,
  );
}

describe('creating a listing', () => {
  it('reads back exactly what was written', async () => {
    const repo = repository();
    const created = await repo.create(draft, author);

    expect(await repo.findById(created.id)).toEqual(created);
    expect(created.status).toBe('ACTIVE');
    expect(created.ownerKey).not.toBe(created.id);
    expect(new Date(created.expiresAt).getTime()).toBeGreaterThan(NOW);
  });

  it('survives concurrent writes', async () => {
    const repo = repository();
    await Promise.all([
      repo.create(draft, author),
      repo.create({ ...draft, title: 'Cahiers' }, author),
      repo.create({ ...draft, title: 'Sac' }, author),
    ]);

    expect(await repo.list()).toHaveLength(3);
  });
});

describe('filtering', () => {
  it('matches on type, district and title, ignoring accents and case', async () => {
    const repo = repository();
    await repo.create(draft, author);
    await repo.create(
      { ...draft, title: 'Sac à dos', type: 'SALE', price: 3000, neighborhoodId: 'grand-yoff' },
      author,
    );

    expect(await repo.list({ type: 'SALE' })).toHaveLength(1);
    expect(await repo.list({ neighborhoodId: 'medina' })).toHaveLength(1);
    expect(await repo.list({ query: 'MATHS' })).toHaveLength(1);
    expect(await repo.list({ query: 'sac a dos' })).toHaveLength(1);
  });
});

describe('the lifecycle', () => {
  it('keeps a completed listing visible, then archives it', async () => {
    const repo = repository();
    const created = await repo.create(draft, author);
    await repo.markAsCompleted(created.id);

    expect(await repo.list()).toHaveLength(1);

    const later = new AsyncStorageListingRepository(
      // Same document, read three days later.
      createMemoryStore({
        [storageKeys.listings]: JSON.stringify([
          { ...created, status: 'COMPLETED', completedAt: new Date(NOW).toISOString() },
        ]),
      }),
      () => NOW + 3 * 24 * 3_600_000,
    );

    expect(await later.list()).toHaveLength(0);
    expect(await later.archiveExpired()).toBe(1);
  });

  it('raises when updating a listing that is gone', async () => {
    const repo = repository();
    await expect(repo.markAsCompleted('missing')).rejects.toBeInstanceOf(ListingNotFoundError);
  });
});

describe('a corrupted document', () => {
  it('reads as empty instead of taking the home screen down', async () => {
    const broken = repository({ [storageKeys.listings]: '{ not json' });
    expect(await broken.list()).toEqual([]);

    const wrongShape = repository({ [storageKeys.listings]: JSON.stringify([{ id: 1 }]) });
    expect(await wrongShape.list()).toEqual([]);
  });
});
