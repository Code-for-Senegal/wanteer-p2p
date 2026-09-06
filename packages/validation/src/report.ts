import { z } from 'zod';
import { REPORT_REASONS, REPORT_TARGETS } from '@wantere/types';
import { idSchema } from './primitives';

export const createReportSchema = z.object({
  targetType: z.enum(REPORT_TARGETS),
  targetId: idSchema,
  reason: z.enum(REPORT_REASONS),
  comment: z.string().trim().max(1000).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
