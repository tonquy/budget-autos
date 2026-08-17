import { z } from 'zod';

export const MAX_LICENSE_BYTES = 8 * 1024 * 1024; // 8MB, after client-side compression
export const MAX_INSURANCE_BYTES = 8 * 1024 * 1024;

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

const dateSchema = (label: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `Enter a valid ${label}.`)
    .refine((val) => !Number.isNaN(new Date(val).getTime()), `Enter a valid ${label}.`);

export const rentalSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name.').max(100),
    phone: z
      .string()
      .trim()
      .min(7, 'Enter a phone number we can reach you at.')
      .max(20)
      .regex(/^[0-9()+\-.\s]+$/, 'That doesn’t look like a valid phone number.'),
    email: z
      .string()
      .trim()
      .min(1, 'Enter your email address.')
      .max(200)
      .refine((val) => z.email().safeParse(val).success, {
        message: 'Enter a valid email address.',
      }),

    vehicleYear: optionalText(10),
    vehicleMake: optionalText(50),
    vehicleModel: optionalText(60),

    pickupDate: dateSchema('pickup date'),
    returnDate: dateSchema('return date'),

    hasLicense: z.enum(['yes', 'no'], 'Let us know if you have a valid driver’s license.'),
    hasInsurance: z.enum(['yes', 'no'], 'Let us know if you have active New York auto insurance.'),
    insuranceCompany: optionalText(120),
    policyNumber: optionalText(60),

    turnstileToken: z.string().min(1, 'Please complete the verification.'),
    // Honeypot field - real users never fill this in.
    company: z.string().max(0).optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (new Date(data.returnDate).getTime() < new Date(data.pickupDate).getTime()) {
      ctx.addIssue({
        code: 'custom',
        path: ['returnDate'],
        message: 'Return date must be on or after the pickup date.',
      });
    }
    if (data.hasInsurance === 'yes' && !data.insuranceCompany) {
      ctx.addIssue({
        code: 'custom',
        path: ['insuranceCompany'],
        message: 'Enter your insurance company.',
      });
    }
    if (data.hasInsurance === 'yes' && !data.policyNumber) {
      ctx.addIssue({
        code: 'custom',
        path: ['policyNumber'],
        message: 'Enter your policy number.',
      });
    }
  });

export type RentalFormValues = z.infer<typeof rentalSchema>;
