import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The minimum a store has to do. Declaring it here rather than importing
 * AsyncStorage everywhere keeps the repository testable without a native mock.
 */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const deviceStore: KeyValueStore = AsyncStorage;

const NAMESPACE = 'p2p-local';

/**
 * The `.v1` suffix is the migration strategy: an incompatible change writes to
 * `.v2` and leaves the old document untouched, so a bad release cannot destroy
 * what someone published.
 */
export const storageKeys = {
  listings: `${NAMESPACE}.listings.v1`,
  contactProfile: `${NAMESPACE}.contact-profile.v1`,
  neighborhood: `${NAMESPACE}.neighborhood.v1`,
} as const;

export function createMemoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const data = new Map(Object.entries(initial));
  return {
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => void data.set(key, value),
    removeItem: async (key) => void data.delete(key),
  };
}
