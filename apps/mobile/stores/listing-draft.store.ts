import { create } from 'zustand';
import type { ListingType } from '@wantere/types';

interface ListingDraftState {
  title: string;
  description: string;
  type: ListingType;
  price: string;
  categoryId: string | null;
  photos: string[];
  update: (patch: Partial<Omit<ListingDraftState, 'update' | 'reset'>>) => void;
  reset: () => void;
}

const initial = {
  title: '',
  description: '',
  type: 'SALE' as ListingType,
  price: '',
  categoryId: null,
  photos: [] as string[],
};

export const useListingDraft = create<ListingDraftState>((set) => ({
  ...initial,
  update: (patch) => set(patch),
  reset: () => set(initial),
}));
