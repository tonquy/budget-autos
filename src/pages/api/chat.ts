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
  type ChatImage,
  type ChatIntake,
  type ChatMessage,
  type ChatModelResult,
} from '../../lib/chatIntake';

export const prerender = false;

// Cheap multimodal flash-lite — supports image input for estimate/part photos.
const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_TOTAL_ATTACHMENT_BYTES = 12 * 1024 * 1024;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

type GeminiContent = { role: 'user' | 'model'; parts: GeminiPart[] };

function collectImages(messages: ChatMessage[]): ChatImage[] {
  const out: ChatImage[] = [];
  for (const m of messages) {
    if (m.role !== 'user' || !m.images?.length) continue;
    for (const img of m.images) out.push(img);
  }
  return out;
}

function messageToGeminiParts(m: ChatMessage): GeminiPart[] {
  const parts: GeminiPart[] = [];
  const text = m.content?.trim();
  if (text) parts.push({ text });
  if (m.role === 'user' && m.images?.length) {
    if (!text) {
      parts.push({
        text: 'Please look at the attached photo(s) and tell me what you see, what it likely means, and what I should do next.',
      });
    }
    for (const img of m.images) {
      parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
    }
  }
  return parts.length > 0 ? parts : [{ text: '(empty message)' }];
}

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

  const contents: GeminiContent[] = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: messageToGeminiParts(m),
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
          temperature: 0.45,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
          responseSchema: geminiResponseSchema,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('Gemini request failed', res.status, detail);
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
    const transcript: ChatMessage[] = [
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
        // Keep image counts in the email transcript without shipping megabytes of base64 into HTML.
        images: m.images?.map((img) => ({ mimeType: img.mimeType, data: '[attached]' })),
      })),
      { role: 'assistant' as const, content: reply },
    ];
    const photoCount = collectImages(messages).length;
    const owner = chatIntakeOwnerEmail(intake, transcript, { photoCount });
    const resendApiKey = env.RESEND_API_KEY;

    const attachments: { filename: string; content: string }[] = [];
    let totalAttachmentBytes = 0;
    collectImages(messages).forEach((img, index) => {
      const approxBytes = Math.floor((img.data.length * 3) / 4);
      if (totalAttachmentBytes + approxBytes > MAX_TOTAL_ATTACHMENT_BYTES) return;
      const ext = img.mimeType === 'image/png' ? 'png' : img.mimeType === 'image/webp' ? 'webp' : 'jpg';
      attachments.push({
        filename: `chat-photo-${index + 1}.${ext}`,
        content: img.data,
      });
      totalAttachmentBytes += approxBytes;
    });

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
          attachments: attachments.length > 0 ? attachments : undefined,
        });
        submitted = true;
      } catch (err) {
        console.error('Failed to send chat intake email via Resend', err);
      }
    } else {
      console.info(`[chat] RESEND_API_KEY not set - would email ${business.email}`, {
        intake,
        photoCount,
        transcript: transcript.map((m) => ({
          role: m.role,
          content: m.content,
          imageCount: m.images?.length ?? 0,
        })),
      });
      submitted = true;
    }
  }

  return jsonResponse({ ok: true, reply, intake, submitted });
};
