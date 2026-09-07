export const API_VERSION = 'v1';
export const API_PREFIX = `api/${API_VERSION}`;

export const PAGINATION = {
  defaultPage: 1,
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

export const LISTING_LIMITS = {
  titleMin: 3,
  titleMax: 120,
  descriptionMax: 5000,
  maxMedia: 10,
  maxPrice: 1_000_000_000,
} as const;

export const MESSAGE_LIMITS = {
  bodyMax: 2000,
} as const;

export const MEDIA = {
  maxFileSizeBytes: 8 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const,
};

export const SEARCH_RADII_METERS = [1000, 5000, 20000, 50000] as const;

/**
 * Public coordinates are snapped to a grid so a listing never points at
 * someone's doorstep. Roughly 1 km at Senegalese latitudes.
 */
export const PUBLIC_LOCATION_PRECISION_DEGREES = 0.01;

export const SUPPORTED_CURRENCIES = ['XOF'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
export const DEFAULT_CURRENCY: SupportedCurrency = 'XOF';

export const DEFAULT_COUNTRY = 'SN';

export const OTP = {
  codeLength: 6,
  ttlSeconds: 300,
  maxAttempts: 5,
  resendCooldownSeconds: 60,
} as const;

export const TOKENS = {
  accessTtl: '15m',
  refreshTtlDays: 30,
} as const;
