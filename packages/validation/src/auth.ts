import { z } from 'zod';
import { OTP } from '@wantere/config';
import { phoneSchema } from './primitives';

export const registerSchema = z.object({
  phone: phoneSchema,
  displayName: z.string().trim().min(2).max(60),
});

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().trim().length(OTP.codeLength).regex(/^\d+$/, 'The code contains digits only'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
