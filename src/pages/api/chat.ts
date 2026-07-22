import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';
import { business } from '../../lib/business';
import { chatIntakeOwnerEmail } from '../../lib/emailTemplates';
import {
  chatIntakeSchema,
  chatRequestSchema,
  chatSystemPrompt,
  geminiResponseSchema,
  intakeIsComplete,
  type ChatIntake,
  type ChatModelResult,
} from '../../lib/chatIntake';

export const prerender = false;

// Cheap, GA "flash-lite" tier - great for this FAQ/intake use.
// (gemini-2.0-flash was shut down June 2026; 2.5-flash-lite is blocked to new
// users, so 3.1-flash-lite is the current cheapest model this project can use:
// ~$0.25/$1.50 per 1M tokens in/out. Verified available on this key.)
const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

type GeminiContent = { role: 'user' | 'model'; parts: { text: string }[] };

export const POST: APIRoute = async ({ request }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'Could not read your message.' }, 400);
  }

  const parsed = chatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonResponse({ ok: false, error: 'Invalid chat request.' }, 400);
  }
  const { messages, intake: priorIntake, alreadySubmitted } = parsed.data;

  const geminiKey = env.GEMINI_API_KEY;
  if (!geminiKey) {
    return jsonResponse(
      { ok: false, error: 'Chat is not configured yet. Please use the Free Quote button instead.' },
      503,
    );
  }

  // Map our transcript to Gemini's content format (assistant -> model). Seed
  // the model with whatever intake we have so far so it carries values forward.
  const contents: GeminiContent[] = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  if (priorIntake) {
    contents.unshift({
      role: 'user',
      parts: [{ text: `(Intake collected so far, carry these forward: ${JSON.stringify(priorIntake)})` }],
    });
  }

  let modelResult: ChatModelResult;
  try {
    const res = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: chatSystemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 800,
          responseMimeType: 'application/json',
          responseSchema: geminiResponseSchema,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('Gemini request failed', res.status, detail);
      // 429 = rate limited / over quota. Tell the widget so it can steer the
      // visitor to the Free Quote form instead of showing a generic error.
      if (res.status === 429) {
        return jsonResponse(
          {
            ok: false,
            overloaded: true,
            error:
              "We're getting a lot of messages right now. Please use the Free Quote button and we'll get right back to you.",
          },
          429,
        );
      }
      return jsonResponse({ ok: false, error: 'The assistant is having trouble right now.' }, 502);
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    if (!text) {
      return jsonResponse({ ok: false, error: 'The assistant did not respond. Please try again.' }, 502);
    }
    modelResult = JSON.parse(text) as ChatModelResult;
  } catch (err) {
    console.error('Gemini call/parse error', err);
    return jsonResponse({ ok: false, error: 'The assistant is having trouble right now.' }, 502);
  }

  // Merge the intake carried forward from the client with what the model
  // returned this turn: the model wins on any field it fills, but we never
  // lose a value it forgot to echo (e.g. name/phone captured earlier). This
  // keeps the completeness check - and therefore the email send - reliable.
  const modelIntake = chatIntakeSchema.parse(modelResult.intake ?? {});
  const carried = chatIntakeSchema.parse(priorIntake ?? {});
  const intake: ChatIntake = { ...carried };
  for (const [key, value] of Object.entries(modelIntake) as [keyof ChatIntake, string][]) {
    if (value) intake[key] = value;
  }
  const reply = (modelResult.reply ?? '').trim() || 'Sorry, could you say that another way?';
  const complete = intakeIsComplete(intake);
  const wantsSubmit = Boolean(modelResult.readyToSubmit) && complete && !alreadySubmitted;

  let submitted = false;
  if (wantsSubmit) {
    // Full transcript = the conversation plus this final assistant reply.
    const transcript = [...messages, { role: 'assistant' as const, content: reply }];
    const owner = chatIntakeOwnerEmail(intake, transcript);
    const resendApiKey = env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: `${business.name} Chat <${env.QUOTE_FROM_EMAIL}>`,
          to: business.email,
          replyTo: intake.email || undefined,
          subject: owner.subject,
          html: owner.html,
          text: owner.text,
        });
        submitted = true;
      } catch (err) {
        console.error('Failed to send chat intake email via Resend', err);
        // Don't hard-fail the chat - the visitor still gets a reply. They can
        // fall back to the Free Quote form.
      }
    } else {
      // No Resend configured (fresh local checkout) - log so the flow still
      // completes end to end during development.
      console.info(`[chat] RESEND_API_KEY not set - would email ${business.email}`, {
        intake,
        transcript,
      });
      submitted = true;
    }
  }

  return jsonResponse({ ok: true, reply, intake, submitted });
};
