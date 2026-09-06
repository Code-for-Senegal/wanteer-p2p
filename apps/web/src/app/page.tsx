'use client';

import { EmptyState } from '@/components/empty-state';
import { useCategories } from '@/features/categories/use-categories';
import { ListingCard } from '@/features/listings/listing-card';
import { useListings } from '@/features/listings/use-listings';

export default function HomePage() {
  const categories = useCategories();
  const listings = useListings({ pageSize: 24 });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-900">Wantere</h1>
        <p className="mt-1 text-neutral-600">
          Acheter, vendre, donner et échanger près de chez soi.
        </p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-2">
        {categories.data?.map((category) => (
          <span
            key={category.id}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700"
          >
            {category.name}
          </span>
        ))}
      </nav>

      {listings.isPending ? (
        <p className="text-sm text-neutral-500">Chargement des annonces…</p>
      ) : listings.isError ? (
        <EmptyState
          title="Les annonces sont indisponibles"
          description="Vérifiez que l'API est démarrée sur le port 4000."
        />
      ) : listings.data && listings.data.items.length > 0 ? (
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {listings.data.items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </section>
      ) : (
        <EmptyState title="Aucune annonce pour le moment" />
      )}
    </main>
  );
}
