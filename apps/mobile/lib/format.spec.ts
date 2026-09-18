import { formatAge, formatAmount, formatListingBadge } from './format';

describe('formatAmount', () => {
  it('groups thousands with a plain space and the local currency label', () => {
    expect(formatAmount(3000)).toBe('3 000 FCFA');
    expect(formatAmount(1250000)).toBe('1 250 000 FCFA');
    expect(formatAmount(500)).toBe('500 FCFA');
  });
});

describe('formatListingBadge', () => {
  it('never shows a price for a donation or a barter', () => {
    expect(formatListingBadge('DONATION', null)).toBe('Gratuit / don');
    expect(formatListingBadge('BARTER', null)).toBe('Troc');
    expect(formatListingBadge('REQUEST', null)).toBe('Besoin');
  });

  it('shows the cost price for a sale', () => {
    expect(formatListingBadge('SALE', 3000)).toBe('Prix coûtant : 3 000 FCFA');
  });
});

describe('formatAge', () => {
  const now = new Date('2026-09-18T12:00:00.000Z').getTime();
  const ago = (ms: number) => new Date(now - ms).toISOString();

  it('reads in minutes, hours then days', () => {
    expect(formatAge(ago(30_000), now)).toBe("À l'instant");
    expect(formatAge(ago(20 * 60_000), now)).toBe('Il y a 20 min');
    expect(formatAge(ago(2 * 3_600_000), now)).toBe('Il y a 2 h');
    expect(formatAge(ago(24 * 3_600_000), now)).toBe('Hier');
    expect(formatAge(ago(3 * 24 * 3_600_000), now)).toBe('Il y a 3 j');
  });
});
