import { z } from 'zod';
import { PAGINATION } from '@p2p-local/config';

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, 'Phone number must be in E.164 format');

export const emailSchema = z.string().trim().toLowerCase().email();

export const idSchema = z.string().uuid();

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');

export const latitudeSchema = z.coerce.number().min(-90).max(90);
export const longitudeSchema = z.coerce.number().min(-180).max(180);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.defaultPage),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.maxPageSize)
    .default(PAGINATION.defaultPageSize),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Senegalese mobile numbers as people type them.
 *
 * `phoneSchema` above is strict E.164, which nobody types: the number is given
 * as "77 123 45 67". This accepts the common spellings and always returns
 * E.164, so everything downstream stores one shape.
 */
export const senegalMobileSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s.-]/g, ''))
  .refine(
    (value) => /^(?:\+221)?7[05-8]\d{7}$/.test(value),
    'Numéro de mobile sénégalais invalide',
  )
  .transform((value) => (value.startsWith('+221') ? value : `+221${value}`));
