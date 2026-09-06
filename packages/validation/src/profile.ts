import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  bio: z.string().trim().max(500).optional(),
  avatarKey: z.string().trim().max(255).nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
