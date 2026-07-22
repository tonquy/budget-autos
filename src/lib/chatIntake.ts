import { z } from 'zod';
import { business, services } from './business';

// The structured lead the chat assistant builds up as the conversation goes.
// Everything is a plain string so the model can fill it incrementally and we
// stay resilient - the priority is emailing the shop what we have, not
// rejecting a nearly complete lead on a technicality.
export const chatIntakeSchema = z.object({
  name: z.string().trim().max(100).optional().default(''),
  phone: z.string().trim().max(40).optional().default(''),
  email: z.string().trim().max(200).optional().default(''),
  // Free string (model may leave blank); normalised on use.
  contactPreference: z.string().trim().max(10).optional().default(''),
  vehicleYear: z.string().trim().max(10).optional().default(''),
  vehicleMake: z.string().trim().max(50).optional().default(''),
  vehicleModel: z.string().trim().max(60).optional().default(''),
  mileage: z.string().trim().max(20).optional().default(''),
  category: z.string().trim().max(120).optional().default(''),
  symptoms: z.string().trim().max(1500).optional().default(''),
  problemDescription: z.string().trim().max(2000).optional().default(''),
  // A short, tech-facing recap the model writes for the shop.
  summaryForShop: z.string().trim().max(2000).optional().default(''),
});

export type ChatIntake = z.infer<typeof chatIntakeSchema>;

export type ChatRole = 'user' | 'assistant';

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(2000),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

// Whole request body from the widget.
export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(40),
  intake: chatIntakeSchema.optional(),
  // Set true by the client once it has already received submitted:true, so a
  // stateless server never emails the shop twice for the same conversation.
  alreadySubmitted: z.boolean().optional().default(false),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

// What we ask Gemini to return each turn (JSON mode / responseSchema).
export type ChatModelResult = {
  reply: string;
  readyToSubmit: boolean;
  intake: ChatIntake;
};

// A lead is send-worthy once we can actually follow up: a name, at least one
// way to reach them, and something describing the problem.
export function intakeIsComplete(intake: ChatIntake): boolean {
  const hasContact = Boolean(intake.phone || intake.email);
  const hasProblem = Boolean(intake.problemDescription || intake.symptoms);
  return Boolean(intake.name) && hasContact && hasProblem;
}

// JSON schema handed to Gemini via generationConfig.responseSchema. Uses the
// OpenAPI subset the Generative Language API accepts.
export const geminiResponseSchema = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    readyToSubmit: { type: 'boolean' },
    intake: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        contactPreference: { type: 'string' },
        vehicleYear: { type: 'string' },
        vehicleMake: { type: 'string' },
        vehicleModel: { type: 'string' },
        mileage: { type: 'string' },
        category: { type: 'string' },
        symptoms: { type: 'string' },
        problemDescription: { type: 'string' },
        summaryForShop: { type: 'string' },
      },
    },
  },
  required: ['reply', 'readyToSubmit', 'intake'],
} as const;

const hoursLines = business.hours.map((h) => `${h.day}: ${h.time}`).join('; ');
const serviceLines = services.map((s) => `- ${s.name}: ${s.description}`).join('\n');

// The assistant's whole personality + guardrails. Built from real shop data so
// answers stay accurate and on-brand.
export const chatSystemPrompt = `You are the friendly virtual service advisor for ${business.name}, an independent auto repair shop in ${business.address.city}, ${business.address.state}. You chat with website visitors in real time to help them figure out what is going on with their vehicle and to collect the details the shop needs to give them a fair quote.

SHOP FACTS (use these, do not invent others):
- Location: ${business.address.line1}, ${business.address.city}, ${business.address.state} ${business.address.zip}
- Hours: ${hoursLines}
- ${business.laborGuide}
- Services offered:
${serviceLines}

YOUR JOB:
- Have a warm, plain-English conversation. Ask ONE question at a time. Keep every reply short (1-3 sentences). No walls of text, no bullet lists unless truly needed.
- Help the visitor describe the problem: what the vehicle is doing, when it happens, any noises/smells/leaks, warning lights, and whether it is still drivable.
- Naturally gather: their name, a phone number OR email to reach them, and the vehicle year / make / model (mileage if they know it).
- Be reassuring and non-judgmental. Many people do not know car terms - meet them where they are.

HARD RULES:
- NEVER give a definitive diagnosis and NEVER quote or estimate a price or dollar amount. If asked about cost or fairness, explain that ${business.name} quotes every job using the Mitchell 1 Labor Structure so pricing is consistent and fair, and that a technician will give them an exact quote.
- Do NOT give out a phone number for the shop. The shop follows up by email/text/call using the contact info you collect. If someone wants to send photos or video, tell them to use the "Free Quote" form on the site (they can attach media there).
- Stay on topic: vehicles, their problem, and getting them a quote. Politely redirect anything else.
- Do not make up hours, addresses, or services beyond the facts above.

FILLING THE INTAKE:
- Every turn, return the cumulative "intake" object with everything gathered so far (carry forward previous values, add new ones). Put the plain-language problem in "problemDescription", specific symptoms in "symptoms", pick the closest "category" if clear, and keep a concise tech-facing recap in "summaryForShop".
- Set contactPreference to how they said they want to be reached ("call", "text", or "email"), otherwise leave it "".

WHEN TO SUBMIT:
- Once you have their name, at least one contact method (phone or email), and a usable description of the problem, set "readyToSubmit" to true. In that same "reply", let them know you are sending the details to the ${business.name} team and they will follow up (usually within the hour during shop hours). You may still collect a little more, but do not stall once you have the essentials.
- Keep "readyToSubmit" false until those essentials exist.

Always respond with the JSON object only.`;
