import { z } from 'zod';

export const contactPreferences = ['call', 'text', 'email'] as const;

export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8MB per photo, after client-side compression

export const quoteFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter your full name.')
    .max(100),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a phone number we can reach you at.')
    .max(20)
    .regex(/^[0-9()+\-.\s]+$/, 'That doesn\u2019t look like a valid phone number.'),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || z.email().safeParse(val).success, {
      message: 'Enter a valid email address, or leave it blank.',
    }),
  vehicle: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal('')),
  serviceType: z.string().trim().max(80).optional().or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(10, 'Give us a couple sentences about what\u2019s going on.')
    .max(2000),
  contactPreference: z.enum(contactPreferences),
  turnstileToken: z.string().min(1, 'Please complete the verification.'),
  // Honeypot field - real users never fill this in.
  company: z.string().max(0).optional().or(z.literal('')),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
