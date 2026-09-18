import { archiveDue, canBeContacted, isVisible } from './listing-lifecycle';
import type { LocalListing } from './listing.types';

const now = new Date('2026-09-18T12:00:00.000Z').getTime();
const at = (hoursAgo: number) => new Date(now - hoursAgo * 3_600_000).toISOString();

function listing(overrides: Partial<LocalListing> = {}): LocalListing {
  return {
    id: 'a',
    ownerKey: 'k',
    source: 'device',
    title: 'Manuel',
    description: '',
    type: 'DONATION',
    price: null,
    neighborhoodId: 'medina',
    photoFileName: null,
    authorFirstName: 'Moussa',
    authorPhone: '+221771234567',
    status: 'ACTIVE',
    createdAt: at(1),
    updatedAt: at(1),
    completedAt: null,
    expiresAt: new Date(now + 3_600_000).toISOString(),
    ...overrides,
  };
}

describe('an active listing', () => {
  it('is visible and can be contacted until it expires', () => {
    expect(isVisible(listing(), now)).toBe(true);
    expect(canBeContacted(listing(), now)).toBe(true);
  });

  it('is due for archiving once past its expiry', () => {
    const expired = listing({ expiresAt: at(1) });
    expect(isVisible(expired, now)).toBe(false);
    expect(archiveDue(expired, now)).toBe(true);
  });
});

describe('a completed listing', () => {
  it('stays visible for the grace period, but cannot be contacted', () => {
    const completed = listing({ status: 'COMPLETED', completedAt: at(2) });
    expect(isVisible(completed, now)).toBe(true);
    expect(canBeContacted(completed, now)).toBe(false);
    expect(archiveDue(completed, now)).toBe(false);
  });

  it('is archived once the grace period is over', () => {
    const completed = listing({ status: 'COMPLETED', completedAt: at(72) });
    expect(isVisible(completed, now)).toBe(false);
    expect(archiveDue(completed, now)).toBe(true);
  });
});
