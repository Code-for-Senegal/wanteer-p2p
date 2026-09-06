import Link from 'next/link';
import { formatDistance, formatPrice } from '@/lib/format';
import type { ListingSummary } from './api';

export function ListingCard({ listing }: { listing: ListingSummary }) {
  const distance = formatDistance(listing.distanceMeters);

  return (
    <Link
      href={`/annonces/${listing.id}`}
      className="block overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-card"
    >
      <div className="aspect-4/3 bg-neutral-100">
        {listing.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm font-medium text-neutral-900">{listing.title}</p>
        <p className="text-sm font-semibold text-brand-600">
          {formatPrice(listing.price, listing.type)}
        </p>
        <p className="text-xs text-neutral-500">
          {[listing.location?.displayName, distance].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  );
}
