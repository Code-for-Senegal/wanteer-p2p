import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'wantere.accessToken';
const REFRESH_TOKEN_KEY = 'wantere.refreshToken';

let cachedAccessToken: string | null = null;

/**
 * Tokens live in the keychain, never in the Zustand store: client state and
 * credentials have different lifetimes and different security requirements.
 */
export const tokenStore = {
  async getAccessToken(): Promise<string | null> {
    cachedAccessToken ??= await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return cachedAccessToken;
  },

  getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async save(tokens: { accessToken: string; refreshToken: string }): Promise<void> {
    cachedAccessToken = tokens.accessToken;
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  async clear(): Promise<void> {
    cachedAccessToken = null;
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
