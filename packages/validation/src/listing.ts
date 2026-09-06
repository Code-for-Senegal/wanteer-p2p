import { z } from 'zod';
import { LISTING_LIMITS, SUPPORTED_CURRENCIES } from '@wantere/config';
import { LISTING_CONDITIONS, LISTING_TYPES, LISTING_STATUSES, requiresPrice } from '@wantere/types';
import { idSchema, latitudeSchema, longitudeSchema, paginationSchema } from './primitives';

export const listingTypeSchema = z.enum(LISTING_TYPES);
export const listingConditionSchema = z.enum(LISTING_CONDITIONS);
export const listingStatusSchema = z.enum(LISTING_STATUSES);

export const createListingSchema = z
  .object({
    title: z.string().trim().min(LISTING_LIMITS.titleMin).max(LISTING_LIMITS.titleMax),
    description: z.string().trim().max(LISTING_LIMITS.descriptionMax),
    type: listingTypeSchema,
    condition: listingConditionSchema.optional(),
    price: z.coerce.number().int().min(0).max(LISTING_LIMITS.maxPrice).optional(),
    currency: z.enum(SUPPORTED_CURRENCIES).optional(),
    categoryId: idSchema,
    latitude: latitudeSchema,
    longitude: longitudeSchema,
    city: z.string().trim().max(80).optional(),
    district: z.string().trim().max(80).optional(),
    mediaKeys: z.array(z.string().trim().max(255)).max(LISTING_LIMITS.maxMedia).default([]),
  })
  .refine((value) => !requiresPrice(value.type) || typeof value.price === 'number', {
    message: 'A price is required for a sale',
    path: ['price'],
  });

export const updateListingSchema = z.object({
  title: z.string().trim().min(LISTING_LIMITS.titleMin).max(LISTING_LIMITS.titleMax).optional(),
  description: z.string().trim().max(LISTING_LIMITS.descriptionMax).optional(),
  condition: listingConditionSchema.optional(),
  price: z.coerce.number().int().min(0).max(LISTING_LIMITS.maxPrice).nullable().optional(),
  categoryId: idSchema.optional(),
  status: z.enum(['ACTIVE', 'RESERVED', 'COMPLETED', 'ARCHIVED']).optional(),
});

export const searchListingsSchema = paginationSchema.extend({
  q: z.string().trim().max(120).optional(),
  type: listingTypeSchema.optional(),
  categoryId: idSchema.optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  condition: listingConditionSchema.optional(),
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  radius: z.coerce.number().int().min(100).max(200_000).optional(),
  sort: z.enum(['recent', 'price_asc', 'price_desc', 'distance']).default('recent'),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;
