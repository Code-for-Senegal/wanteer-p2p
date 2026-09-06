import { configureApiClient, request } from '@wantere/api-client';
import { API_PREFIX } from '@wantere/config';

configureApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
});

export function apiPath(path: string): string {
  return `/${API_PREFIX}${path}`;
}

export { request };
