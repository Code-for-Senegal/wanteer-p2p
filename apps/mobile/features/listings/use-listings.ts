import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useListingRepository } from './listing-repository.context';
import type { DraftListing } from './listing.schema';
import type { ListingAuthor, ListingFilter } from './listing.types';

const LISTINGS = ['listings'] as const;

export function useListings(filter: ListingFilter = {}) {
  const repository = useListingRepository();

  return useQuery({
    queryKey: [...LISTINGS, filter],
    queryFn: () => repository.list(filter),
  });
}

export function useListing(id: string | undefined) {
  const repository = useListingRepository();

  return useQuery({
    queryKey: [...LISTINGS, 'detail', id],
    queryFn: () => repository.findById(id as string),
    enabled: Boolean(id),
  });
}

export function usePublishListing() {
  const repository = useListingRepository();
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ draft, author }: { draft: DraftListing; author: ListingAuthor }) =>
      repository.create(draft, author),
    onSuccess: () => client.invalidateQueries({ queryKey: LISTINGS }),
  });
}

export function useMarkAsCompleted() {
  const repository = useListingRepository();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.markAsCompleted(id),
    onSuccess: () => client.invalidateQueries({ queryKey: LISTINGS }),
  });
}

export function useRemoveListing() {
  const repository = useListingRepository();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: LISTINGS }),
  });
}
