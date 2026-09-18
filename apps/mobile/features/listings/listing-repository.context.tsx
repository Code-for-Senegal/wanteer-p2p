import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { AsyncStorageListingRepository } from './async-storage-listing-repository';
import type { ListingRepository } from './listing-repository';

const ListingRepositoryContext = createContext<ListingRepository | null>(null);

/**
 * The one place that decides where listings live. Swapping the device for a
 * server is this line, not a rewrite of the screens.
 */
export function ListingRepositoryProvider({
  children,
  repository,
}: {
  children: ReactNode;
  repository?: ListingRepository;
}) {
  const value = useMemo(() => repository ?? new AsyncStorageListingRepository(), [repository]);

  return (
    <ListingRepositoryContext.Provider value={value}>{children}</ListingRepositoryContext.Provider>
  );
}

export function useListingRepository(): ListingRepository {
  const repository = useContext(ListingRepositoryContext);
  if (repository === null) {
    throw new Error('useListingRepository must be used inside ListingRepositoryProvider');
  }
  return repository;
}
