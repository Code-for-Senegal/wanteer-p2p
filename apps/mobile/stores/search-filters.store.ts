import { create } from 'zustand';
import { DEFAULT_NEIGHBORHOOD_ID } from '@p2p-local/config';
import type { ListingType } from '@p2p-local/types';

/** Client-only state: what is being filtered on, nothing fetched. */
interface SearchFiltersState {
  query: string;
  type: ListingType | null;
  neighborhoodId: string;
  setQuery: (query: string) => void;
  setType: (type: ListingType | null) => void;
  setNeighborhood: (neighborhoodId: string) => void;
  reset: () => void;
}

const initial = {
  query: '',
  type: null,
  neighborhoodId: DEFAULT_NEIGHBORHOOD_ID,
} as const;

export const useSearchFilters = create<SearchFiltersState>((set) => ({
  ...initial,
  setQuery: (query) => set({ query }),
  setType: (type) => set({ type }),
  setNeighborhood: (neighborhoodId) => set({ neighborhoodId }),
  reset: () => set(initial),
}));
