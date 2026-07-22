import { z } from 'zod';

export const contactPreferences = ['call', 'text', 'email'] as const;

export const MAX_FILES = 8;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB per image, after client-side compression
export const MAX_VIDEO_BYTES = 64 * 1024 * 1024; // 64MB per video clip

// The three end-forms the guided wizard can resolve to. Kept as a discriminator
// so the API and owner email can render the right sections.
export const intakeFlows = ['estimate-review', 'known-repair', 'unknown-intake'] as const;
export type IntakeFlow = (typeof intakeFlows)[number];

export const flowLabels: Record<IntakeFlow, string> = {
  'estimate-review': 'Estimate review (has a written estimate)',
  'known-repair': 'Known repair request (no estimate)',
  'unknown-intake': 'Not sure what is wrong (assisted intake)',
};

// --- Shared choice lists (single source of truth for client, server, email) ---

export const estimateHelpOptions = [
  'Is the price fair?',
  'Are all repairs necessary?',
  'Can Budget Auto save me money?',
  'Help me understand the estimate',
  'I want a second opinion',
] as const;

export const knownBasisOptions = [
  'Another mechanic diagnosed it',
  'I have diagnostic trouble codes',
  'I replaced or tested some parts',
  'I have a scan report',
  'I believe I know the repair',
] as const;

export const beginOptions = [
  'Describe my vehicle problem',
  'I have warning lights or codes',
  'My vehicle is making a noise',
  'My vehicle will not start',
  'My vehicle is leaking fluid',
  'My vehicle is driving differently',
  'I am not sure where to begin',
] as const;

export const problemCategories = [
  'Starting or battery concern',
  'Engine or warning-light concern',
  'Brake concern',
  'Steering or suspension concern',
  'Transmission concern',
  'Electrical concern',
  'Heating or air-conditioning concern',
  'Leak, smoke or overheating concern',
  'Unknown - physical diagnosis required',
] as const;

export const symptomStartOptions = ['Today', 'This week', 'A while ago', 'Not sure'] as const;

export const symptomWhenOptions = [
  'All the time',
  'When starting',
  'While braking',
  'While accelerating',
  'At idle',
  'Over bumps',
  'Comes and goes',
] as const;

export const warningLightOptions = [
  'Check engine',
  'Oil pressure',
  'Battery / charging',
  'Brake',
  'ABS',
  'Temperature',
  'Tire pressure',
  'Airbag',
  'Other',
] as const;

export const symptomOptions = [
  'Unusual noise',
  'Burning or odd smell',
  'Smoke or steam',
  'Fluid leak',
  'Vibration or shaking',
  'None of these',
] as const;

export const drivableOptions = [
  'Yes, it drives fine',
  'It drives but feels unsafe',
  'No, it will not drive',
] as const;

export const nextStepOptions = [
  'Call me to talk it through',
  'Text me',
  'Schedule a diagnostic',
  'Just send me an estimate',
] as const;

const CURRENT_YEAR = new Date().getFullYear();

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

// Loose array of short choice strings. The client only ever submits values from
// the lists above, so we validate shape/size rather than exact membership to
// stay resilient (the priority is emailing the shop everything, not rejecting).
const choiceArray = z.array(z.string().trim().max(120)).max(25).optional();

export const intakeSchema = z
  .object({
    flow: z.enum(intakeFlows),

    // Customer
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
    contactPreference: z.enum(contactPreferences),

    // Vehicle
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

    // Primary description (labelled per flow in the UI).
    message: z
      .string()
      .trim()
      .min(10, 'Give us a couple sentences about what\u2019s going on.')
      .max(2000),

    // Path-specific extras (all optional; only the relevant ones are sent).
    estimateHelp: choiceArray,
    knownBasis: choiceArray,
    beginChoice: optionalText(120),
    diagnosticCodes: optionalText(300),
    helpNeeded: optionalText(2000),

    // Scripted assistant answers (unknown-intake path).
    symptomStarted: optionalText(60),
    symptomWhen: choiceArray,
    warningLights: choiceArray,
    symptoms: choiceArray,
    drivable: optionalText(60),
    alreadyDone: optionalText(2000),
    category: optionalText(80),
    assistantSummary: optionalText(4000),
    nextStep: optionalText(80),

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

export type IntakeFormValues = z.infer<typeof intakeSchema>;
