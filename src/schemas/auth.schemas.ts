import { z } from 'zod';
import { isWhitelistedEmail } from '../utils/whitelist';

// Strong password regex: 1 uppercase, 1 lowercase, 1 number, 1 special character, min 8 chars
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .refine((val) => isWhitelistedEmail(val), {
      message: 'Email must belong to a whitelisted college domain.',
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
    ),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms & Conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const otpSchema = z.object({
  code: z.string().length(6, 'Verification code must be exactly 6 digits').regex(/^\d+$/, 'Verification code must only contain digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().length(6, 'Verification code must be exactly 6 digits').regex(/^\d+$/, 'Verification code must only contain digits'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
    ),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
