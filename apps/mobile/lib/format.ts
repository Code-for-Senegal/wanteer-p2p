import type { ListingType } from '@p2p-local/types';

/**
 * Amounts are formatted by hand.
 *
 * `Intl.NumberFormat('fr-SN', { currency: 'XOF' })` cannot be relied on: the
 * locale is not guaranteed in the ICU bundled with Hermes, and its output
 * ("3 000 F CFA") is not what the product says ("3 000 FCFA").
 */
export function formatAmount(amount: number): string {
  const digits = Math.round(amount).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${grouped} FCFA`;
}

export function formatListingBadge(type: ListingType, price: number | null): string {
  switch (type) {
    case 'DONATION':
      return 'Gratuit / don';
    case 'BARTER':
      return 'Troc';
    case 'REQUEST':
      return 'Besoin';
    case 'SALE':
      return price === null ? 'Prix coûtant' : `Prix coûtant : ${formatAmount(price)}`;
  }
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Il y a 2 h". Written out rather than left to Intl.RelativeTimeFormat. */
export function formatAge(iso: string, now: number = Date.now()): string {
  const elapsed = Math.max(0, now - new Date(iso).getTime());

  if (elapsed < HOUR) {
    const minutes = Math.floor(elapsed / MINUTE);
    return minutes < 1 ? "À l'instant" : `Il y a ${minutes} min`;
  }
  if (elapsed < DAY) {
    return `Il y a ${Math.floor(elapsed / HOUR)} h`;
  }
  const days = Math.floor(elapsed / DAY);
  return days === 1 ? 'Hier' : `Il y a ${days} j`;
}
