import { z } from 'zod';
import { LISTING_LIMITS } from '@p2p-local/config';
import { LISTING_TYPES, requiresPrice } from '@p2p-local/types';
import { senegalMobileSchema } from '@p2p-local/validation';

export const listingTypeSchema = z.enum(LISTING_TYPES);

/** What the publish form collects. Four fields, plus a price when it applies. */
export const draftListingSchema = z
  .object({
    title: z.string().trim().min(LISTING_LIMITS.titleMin).max(LISTING_LIMITS.titleMax),
    // 600 characters, not the API's 5000: this is a phone keyboard.
    description: z.string().trim().max(600).default(''),
    type: listingTypeSchema,
    price: z.number().int().min(0).max(LISTING_LIMITS.maxPrice).nullable().default(null),
    neighborhoodId: z.string().min(1),
    photoFileName: z.string().nullable().default(null),
  })
  .refine((value) => !requiresPrice(value.type) || value.price !== null, {
    message: 'Indiquez le prix coûtant',
    path: ['price'],
  })
  .refine((value) => requiresPrice(value.type) || value.price === null, {
    message: 'Un don ou un troc n’a pas de prix',
    path: ['price'],
  });

export type DraftListing = z.infer<typeof draftListingSchema>;

export const storedListingSchema = z.object({
  id: z.string().min(1),
  ownerKey: z.string().min(1),
  source: z.literal('device'),
  title: z.string(),
  description: z.string(),
  type: listingTypeSchema,
  price: z.number().nullable(),
  neighborhoodId: z.string(),
  photoFileName: z.string().nullable(),
  authorFirstName: z.string(),
  authorPhone: z.string(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable(),
  expiresAt: z.string(),
});

export const storedListingsSchema = z.array(storedListingSchema);

export const listingAuthorSchema = z.object({
  firstName: z.string().trim().min(1, 'Indiquez votre prénom').max(40),
  phone: senegalMobileSchema,
});
