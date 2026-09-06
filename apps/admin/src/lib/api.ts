import { configureApiClient, request } from '@wantere/api-client';
import { API_PREFIX } from '@wantere/config';
import { session } from '@/features/auth/session';

configureApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  getAccessToken: () => session.read()?.accessToken ?? null,
  onUnauthorized: () => {
    session.clear();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      // A hard navigation, so every cached query and in-memory state is dropped
      // along with the expired session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/login');
    }
  },
});

export function apiPath(path: string): string {
  return `/${API_PREFIX}${path}`;
}

export { request };
