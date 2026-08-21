import { z } from 'zod';
import { serviceAppointments } from './booking';

const serviceSlugs = serviceAppointments.map((appointment) => appointment.slug);

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

export const bookingSchema = z.object({
  // Which service the customer picked. Constrained to real slugs so the API can
  // resolve a Cal.com event type and a duration from it.
  serviceSlug: z
    .string()
    .trim()
    .refine((value) => serviceSlugs.includes(value), { message: 'Choose the service you need.' }),

  /**
   * Start of the appointment as an ISO instant. Validated for parseability here;
   * whether it is far enough out and still free is checked in the API route,
   * which is the only place that can be trusted about time.
   */
  slotStart: z
    .string()
    .trim()
    .min(1, 'Pick a time for your appointment.')
    .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Pick a time for your appointment.' }),

  name: z.string().trim().min(2, 'Enter your full name.').max(100),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a phone number we can reach you at.')
    .max(20)
    .regex(/^[0-9()+\-.\s]+$/, 'That doesn\u2019t look like a valid phone number.'),
  // Required here, unlike the quote form: the confirmation email is the whole
  // point of a booking, and Cal.com needs an attendee address to create one.
  email: z
    .string()
    .trim()
    .min(1, 'Enter an email so we can send your confirmation.')
    .max(200)
    .refine((value) => z.email().safeParse(value).success, {
      message: 'Enter a valid email address.',
    }),

  vehicleYear: optionalText(10),
  vehicleMake: optionalText(50),
  vehicleModel: optionalText(60),
  mileage: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || /^[\d,\s]{1,9}$/.test(value), {
      message: 'Enter mileage as a number, or leave it blank.',
    }),

  notes: optionalText(2000),

  turnstileToken: z.string().min(1, 'Please complete the verification.'),
  // Honeypot - real users never fill this in.
  company: z.string().max(0).optional().or(z.literal('')),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
