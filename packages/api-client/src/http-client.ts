export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => string | null | Promise<string | null>;
  onUnauthorized?: () => void | Promise<void>;
  fetch?: typeof globalThis.fetch;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let options: ApiClientOptions = { baseUrl: '' };

export function configureApiClient(next: ApiClientOptions): void {
  options = next;
}

/** Single entry point used by every generated operation. */
export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const token = await options.getAccessToken?.();
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const doFetch = options.fetch ?? globalThis.fetch;
  const response = await doFetch(`${options.baseUrl}${url}`, { ...init, headers });

  if (response.status === 401) {
    await options.onUnauthorized?.();
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, payload, describe(payload) ?? response.statusText);
  }

  return payload as T;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('application/json') ? response.json() : response.text();
}

function describe(payload: unknown): string | null {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message: unknown }).message;
    return Array.isArray(message) ? message.join(', ') : String(message);
  }
  return null;
}
