/**
 * Districts are a closed list, not free text.
 *
 * A listing is found by district, so the values have to be comparable: free
 * text produces "Parcelles", "parcelles assainies" and "PA" for one place, and
 * none of them group together. A short list is also faster to tap than a
 * keyboard on an entry-level phone.
 */
export interface Neighborhood {
  /** Stable slug. This is what a listing stores. */
  id: string;
  name: string;
  department: string;
  region: string;
}

const DAKAR = { department: 'Dakar', region: 'Dakar' } as const;
const PIKINE = { department: 'Pikine', region: 'Dakar' } as const;
const GUEDIAWAYE = { department: 'Guédiawaye', region: 'Dakar' } as const;
const RUFISQUE = { department: 'Rufisque', region: 'Dakar' } as const;
const KEUR_MASSAR = { department: 'Keur Massar', region: 'Dakar' } as const;

export const SENEGAL_NEIGHBORHOODS: readonly Neighborhood[] = [
  { id: 'almadies', name: 'Almadies', ...DAKAR },
  { id: 'castors', name: 'Castors', ...DAKAR },
  { id: 'colobane', name: 'Colobane', ...DAKAR },
  { id: 'dieuppeul', name: 'Dieuppeul', ...DAKAR },
  { id: 'fann-point-e', name: 'Fann / Point E', ...DAKAR },
  { id: 'grand-dakar', name: 'Grand Dakar', ...DAKAR },
  { id: 'grand-yoff', name: 'Grand Yoff', ...DAKAR },
  { id: 'gueule-tapee', name: 'Gueule Tapée', ...DAKAR },
  { id: 'hlm', name: 'HLM', ...DAKAR },
  { id: 'liberte-6', name: 'Liberté 6', ...DAKAR },
  { id: 'medina', name: 'Médina', ...DAKAR },
  { id: 'mermoz', name: 'Mermoz', ...DAKAR },
  { id: 'ngor', name: 'Ngor', ...DAKAR },
  { id: 'ouakam', name: 'Ouakam', ...DAKAR },
  { id: 'parcelles-assainies', name: 'Parcelles Assainies', ...DAKAR },
  { id: 'plateau', name: 'Plateau', ...DAKAR },
  { id: 'sacre-coeur', name: 'Sacré-Cœur', ...DAKAR },
  { id: 'sicap-liberte', name: 'Sicap Liberté', ...DAKAR },
  { id: 'yoff', name: 'Yoff', ...DAKAR },
  { id: 'pikine', name: 'Pikine', ...PIKINE },
  { id: 'thiaroye', name: 'Thiaroye', ...PIKINE },
  { id: 'guediawaye', name: 'Guédiawaye', ...GUEDIAWAYE },
  { id: 'golf-sud', name: 'Golf Sud', ...GUEDIAWAYE },
  { id: 'keur-massar', name: 'Keur Massar', ...KEUR_MASSAR },
  { id: 'malika', name: 'Malika', ...KEUR_MASSAR },
  { id: 'yeumbeul', name: 'Yeumbeul', ...KEUR_MASSAR },
  { id: 'rufisque', name: 'Rufisque', ...RUFISQUE },
  { id: 'bargny', name: 'Bargny', ...RUFISQUE },
];

export const DEFAULT_NEIGHBORHOOD_ID = 'parcelles-assainies';

export function findNeighborhood(id: string): Neighborhood | undefined {
  return SENEGAL_NEIGHBORHOODS.find((neighborhood) => neighborhood.id === id);
}

export function neighborhoodName(id: string): string {
  return findNeighborhood(id)?.name ?? id;
}

/** How long a listing stays visible before it archives itself. */
export const LISTING_TTL_DAYS = 30;

/** How long a completed listing stays visible, greyed out, before archiving. */
export const COMPLETED_LISTING_GRACE_HOURS = 48;
