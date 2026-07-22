import type { APIRoute } from 'astro';
import { Buffer } from 'node:buffer';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';
import { z } from 'zod';
import { business } from '../../lib/business';
import { customerConfirmationEmail, ownerNotificationEmail } from '../../lib/emailTemplates';
import { MAX_FILES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, intakeSchema } from '../../lib/quoteSchema';
import { verifyTurnstileToken } from '../../lib/turnstile';

export const prerender = false;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
  'video/3gpp',
]);

// Resend caps total email size around 40MB; stay well under so the owner email always sends.
// Anything beyond this is still stored in R2 and noted in the email instead of attached.
const MAX_TOTAL_ATTACHMENT_BYTES = 18 * 1024 * 1024;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ ok: false, error: 'Could not read submission.' }, 400);
  }

  const getStr = (key: string) => String(formData.get(key) ?? '');
  const getArr = (key: string) =>
    formData
      .getAll(key)
      .map((v) => String(v))
      .filter(Boolean);

  const raw = {
    flow: getStr('flow'),
    name: getStr('name'),
    phone: getStr('phone'),
    email: getStr('email'),
    contactPreference: getStr('contactPreference') || 'call',
    vehicleYear: getStr('vehicleYear'),
    vehicleMake: getStr('vehicleMake'),
    vehicleModel: getStr('vehicleModel'),
    vin: getStr('vin'),
    mileage: getStr('mileage'),
    message: getStr('message'),
    estimateHelp: getArr('estimateHelp'),
    knownBasis: getArr('knownBasis'),
    beginChoice: getStr('beginChoice'),
    diagnosticCodes: getStr('diagnosticCodes'),
    helpNeeded: getStr('helpNeeded'),
    symptomStarted: getStr('symptomStarted'),
    symptomWhen: getArr('symptomWhen'),
    warningLights: getArr('warningLights'),
    symptoms: getArr('symptoms'),
    drivable: getStr('drivable'),
    alreadyDone: getStr('alreadyDone'),
    category: getStr('category'),
    assistantSummary: getStr('assistantSummary'),
    nextStep: getStr('nextStep'),
    turnstileToken: getStr('turnstileToken'),
    company: getStr('company'),
  };

  // Honeypot: real visitors never populate this hidden field.
  if (raw.company) {
    return jsonResponse({ ok: true });
  }

  const parsed = intakeSchema.safeParse(raw);
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

  const mediaEntries = formData
    .getAll('media')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (mediaEntries.length > MAX_FILES) {
    return jsonResponse({ ok: false, error: `Please attach at most ${MAX_FILES} files.` }, 400);
  }

  const validMedia: { file: File; kind: 'image' | 'video' }[] = [];
  for (const file of mediaEntries) {
    const isImage = ALLOWED_IMAGE_TYPES.has(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.has(file.type);
    if (!isImage && !isVideo) continue;

    const cap = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > cap) {
      return jsonResponse({ ok: false, error: 'One of your files is too large. Please try again.' }, 400);
    }
    validMedia.push({ file, kind: isImage ? 'image' : 'video' });
  }

  const imageCount = validMedia.filter((m) => m.kind === 'image').length;
  const videoCount = validMedia.filter((m) => m.kind === 'video').length;

  const submissionId = crypto.randomUUID();
  const uploadedKeys: string[] = [];
  const attachments: { filename: string; content: string }[] = [];
  let totalAttachmentBytes = 0;
  let notAttachedCount = 0;

  for (const [index, { file }] of validMedia.entries()) {
    const buffer = await file.arrayBuffer();
    const extension = file.type.split('/')[1] ?? 'bin';
    const key = `quotes/${submissionId}/${index}.${extension}`;

    try {
      await env.QUOTE_PHOTOS.put(key, buffer, {
        httpMetadata: { contentType: file.type },
      });
      uploadedKeys.push(key);
    } catch (err) {
      console.error('Failed to upload file to R2', err);
    }

    if (totalAttachmentBytes + buffer.byteLength <= MAX_TOTAL_ATTACHMENT_BYTES) {
      attachments.push({
        filename: file.name || `file-${index + 1}.${extension}`,
        content: Buffer.from(buffer).toString('base64'),
      });
      totalAttachmentBytes += buffer.byteLength;
    } else {
      // Too large to attach to the email - it's still saved in R2.
      notAttachedCount += 1;
    }
  }

  const mediaSummary = { imageCount, videoCount, attachedCount: attachments.length, notAttachedCount };
  const owner = ownerNotificationEmail(data, mediaSummary);
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
      media: uploadedKeys,
    });
  }

  return jsonResponse({ ok: true, submissionId });
};
