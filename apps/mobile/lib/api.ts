import { configureApiClient, request } from '@p2p-local/api-client';
import { API_PREFIX } from '@p2p-local/config';
import { tokenStore } from './token-store';

configureApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000',
  getAccessToken: () => tokenStore.getAccessToken(),
  onUnauthorized: () => tokenStore.clear(),
});

export function apiPath(path: string): string {
  return `/${API_PREFIX}${path}`;
}

export { request };
