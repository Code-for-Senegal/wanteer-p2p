import { configureApiClient, request } from '@p2p-local/api-client';
import { API_PREFIX } from '@p2p-local/config';

configureApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
});

export function apiPath(path: string): string {
  return `/${API_PREFIX}${path}`;
}

export { request };
