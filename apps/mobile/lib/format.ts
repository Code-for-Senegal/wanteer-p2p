const formatter = new Intl.NumberFormat('fr-SN', {
  style: 'currency',
  currency: 'XOF',
  maximumFractionDigits: 0,
});

export function formatPrice(price: number | null, type: string): string {
  if (type === 'DONATION') return 'Don';
  if (type === 'BARTER') return 'Troc';
  return price === null ? 'Prix à discuter' : formatter.format(price);
}
