'use client';

import { useParams } from 'next/navigation';
import { EmptyState } from '@/components/empty-state';
import { formatPrice } from '@/lib/format';
import { useListing } from '@/features/listings/use-listing';

export default function ListingPage() {
  const params = useParams<{ id: string }>();
  const listing = useListing(params.id);

  if (listing.isPending) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-500">Chargement…</main>
    );
  }

  if (listing.isError || !listing.data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <EmptyState title="Annonce introuvable" />
      </main>
    );
  }

  const data = listing.data;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900">{data.title}</h1>
      <p className="mt-2 text-xl font-semibold text-brand-600">
        {formatPrice(data.price, data.type)}
      </p>
      <p className="mt-1 text-sm text-neutral-500">{data.location?.displayName}</p>

      {data.media.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {data.media.map((media) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={media.id}
              src={media.url}
              alt=""
              className="aspect-4/3 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      ) : null}

      <p className="mt-6 whitespace-pre-line text-neutral-800">{data.description}</p>

      <footer className="mt-8 border-t border-neutral-200 pt-4 text-sm text-neutral-600">
        Publié par {data.seller.displayName}
      </footer>
    </main>
  );
}
