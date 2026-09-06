const currencyFormatter = new Intl.NumberFormat('fr-SN', {
  style: 'currency',
  currency: 'XOF',
  maximumFractionDigits: 0,
});

export function formatPrice(price: number | null, type: string): string {
  if (type === 'DONATION') {
    return 'Don';
  }
  if (type === 'BARTER') {
    return 'Troc';
  }
  if (price === null) {
    return 'Prix à discuter';
  }
  return currencyFormatter.format(price);
}

export function formatDistance(meters: number | null): string | null {
  if (meters === null) {
    return null;
  }
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`;
}
