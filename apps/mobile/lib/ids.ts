import * as Crypto from 'expo-crypto';

/** Hermes does not guarantee globalThis.crypto.randomUUID, expo-crypto does. */
export function newId(): string {
  return Crypto.randomUUID();
}
