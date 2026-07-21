import { z } from 'zod';

export const contactPreferences = ['call', 'text', 'email'] as const;

export const MAX_FILES = 8;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB per image, after client-side compression
export const MAX_VIDEO_BYTES = 64 * 1024 * 1024; // 64MB per video clip

const CURRENT_YEAR = new Date().getFullYear();

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

export const quoteFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name.').max(100),
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
    vehicleYear: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => {
          if (!val) return true;
          if (!/^\d{4}$/.test(val)) return false;
          const year = Number(val);
          return year >= 1900 && year <= CURRENT_YEAR + 1;
        },
        { message: 'Enter a 4-digit year, or leave it blank.' },
      ),
    vehicleMake: optionalText(50),
    vehicleModel: optionalText(60),
    vin: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine((val) => !val || /^[A-HJ-NPR-Za-hj-npr-z0-9]{11,17}$/.test(val), {
        message: 'Enter a valid VIN (11\u201317 characters), or leave it blank.',
      }),
    mileage: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine((val) => !val || /^[\d,\s]{1,9}$/.test(val), {
        message: 'Enter mileage as a number, or leave it blank.',
      }),
    serviceType: optionalText(80),
    message: z
      .string()
      .trim()
      .min(10, 'Give us a couple sentences about what\u2019s going on.')
      .max(2000),
    contactPreference: z.enum(contactPreferences),
    turnstileToken: z.string().min(1, 'Please complete the verification.'),
    // Honeypot field - real users never fill this in.
    company: z.string().max(0).optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.contactPreference === 'email' && !data.email) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'Add an email address since you asked us to email you back.',
      });
    }
  });

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
