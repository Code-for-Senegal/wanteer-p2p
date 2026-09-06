import { create } from 'zustand';
import type { ListingType } from '@wantere/types';

/** Client-only state: what the user is currently filtering on, nothing fetched. */
interface SearchFiltersState {
  query: string;
  type: ListingType | null;
  categoryId: string | null;
  radiusMeters: number | null;
  setQuery: (query: string) => void;
  setType: (type: ListingType | null) => void;
  setCategory: (categoryId: string | null) => void;
  setRadius: (radiusMeters: number | null) => void;
  reset: () => void;
}

const initial = {
  query: '',
  type: null,
  categoryId: null,
  radiusMeters: null,
} as const;

export const useSearchFilters = create<SearchFiltersState>((set) => ({
  ...initial,
  setQuery: (query) => set({ query }),
  setType: (type) => set({ type }),
  setCategory: (categoryId) => set({ categoryId }),
  setRadius: (radiusMeters) => set({ radiusMeters }),
  reset: () => set(initial),
}));
