import type { APIRoute } from 'astro';
import { Buffer } from 'node:buffer';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';
import { z } from 'zod';
import { business } from '../../lib/business';
import { customerConfirmationEmail, ownerNotificationEmail } from '../../lib/emailTemplates';
import { MAX_PHOTOS, MAX_PHOTO_BYTES, quoteFormSchema } from '../../lib/quoteSchema';
import { verifyTurnstileToken } from '../../lib/turnstile';

export const prerender = false;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ ok: false, error: 'Could not read submission.' }, 400);
  }

  const raw = {
    name: String(formData.get('name') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    email: String(formData.get('email') ?? ''),
    vehicle: String(formData.get('vehicle') ?? ''),
    serviceType: String(formData.get('serviceType') ?? ''),
    message: String(formData.get('message') ?? ''),
    contactPreference: String(formData.get('contactPreference') ?? 'call'),
    turnstileToken: String(formData.get('turnstileToken') ?? ''),
    company: String(formData.get('company') ?? ''),
  };

  // Honeypot: real visitors never populate this hidden field.
  if (raw.company) {
    return jsonResponse({ ok: true });
  }

  const parsed = quoteFormSchema.safeParse(raw);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return jsonResponse({ ok: false, error: 'Please check the form and try again.', fieldErrors }, 400);
  }
  const data = parsed.data;

  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  const isVerified = await verifyTurnstileToken(data.turnstileToken, turnstileSecret, clientAddress);
  if (!isVerified) {
    return jsonResponse({ ok: false, error: 'Verification failed. Please try again.' }, 400);
  }

  const photoEntries = formData
    .getAll('photos')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (photoEntries.length > MAX_PHOTOS) {
    return jsonResponse({ ok: false, error: `Please attach at most ${MAX_PHOTOS} photos.` }, 400);
  }

  const validPhotos: File[] = [];
  for (const file of photoEntries) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) continue;
    if (file.size > MAX_PHOTO_BYTES) {
      return jsonResponse({ ok: false, error: 'One of your photos is too large. Please try again.' }, 400);
    }
    validPhotos.push(file);
  }

  const submissionId = crypto.randomUUID();
  const uploadedKeys: string[] = [];
  const attachments: { filename: string; content: string }[] = [];

  for (const [index, file] of validPhotos.entries()) {
    const buffer = await file.arrayBuffer();
    const extension = file.type.split('/')[1] ?? 'jpg';
    const key = `quotes/${submissionId}/${index}.${extension}`;

    try {
      await env.QUOTE_PHOTOS.put(key, buffer, {
        httpMetadata: { contentType: file.type },
      });
      uploadedKeys.push(key);
    } catch (err) {
      console.error('Failed to upload photo to R2', err);
    }

    attachments.push({
      filename: file.name || `photo-${index + 1}.${extension}`,
      content: Buffer.from(buffer).toString('base64'),
    });
  }

  const owner = ownerNotificationEmail(data, validPhotos.length);
  const resendApiKey = env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);

      await resend.emails.send({
        from: `${business.name} Quotes <${env.QUOTE_FROM_EMAIL}>`,
        to: env.OWNER_NOTIFICATION_EMAIL,
        replyTo: data.email || undefined,
        subject: owner.subject,
        html: owner.html,
        text: owner.text,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (data.email) {
        const confirmation = customerConfirmationEmail(data);
        await resend.emails.send({
          from: `${business.name} <${env.QUOTE_FROM_EMAIL}>`,
          to: data.email,
          subject: confirmation.subject,
          html: confirmation.html,
          text: confirmation.text,
        });
      }
    } catch (err) {
      console.error('Failed to send quote email via Resend', err);
      return jsonResponse(
        { ok: false, error: 'We saved your request but the confirmation email failed to send. Call us to confirm.' },
        502,
      );
    }
  } else {
    // No RESEND_API_KEY configured (e.g. fresh local checkout) - log instead of failing,
    // so the demo/mockup still completes successfully end to end.
    console.info('[quote] RESEND_API_KEY not set - logging submission instead of emailing.', {
      submissionId,
      ...data,
      turnstileToken: undefined,
      photos: uploadedKeys,
    });
  }

  return jsonResponse({ ok: true, submissionId });
};
