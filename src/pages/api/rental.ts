import type { APIRoute } from 'astro';
import { Buffer } from 'node:buffer';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';
import { z } from 'zod';
import { business } from '../../lib/business';
import { customerRentalConfirmationEmail, ownerRentalNotificationEmail } from '../../lib/emailTemplates';
import { MAX_INSURANCE_BYTES, MAX_LICENSE_BYTES, rentalSchema } from '../../lib/rentalSchema';
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

  const getStr = (key: string) => String(formData.get(key) ?? '');

  const raw = {
    name: getStr('name'),
    phone: getStr('phone'),
    email: getStr('email'),
    vehicleYear: getStr('vehicleYear'),
    vehicleMake: getStr('vehicleMake'),
    vehicleModel: getStr('vehicleModel'),
    pickupDate: getStr('pickupDate'),
    returnDate: getStr('returnDate'),
    hasLicense: getStr('hasLicense'),
    hasInsurance: getStr('hasInsurance'),
    insuranceCompany: getStr('insuranceCompany'),
    policyNumber: getStr('policyNumber'),
    turnstileToken: getStr('turnstileToken'),
    company: getStr('company'),
  };

  // Honeypot: real visitors never populate this hidden field.
  if (raw.company) {
    return jsonResponse({ ok: true });
  }

  const parsed = rentalSchema.safeParse(raw);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return jsonResponse({ ok: false, error: 'Please check the form and try again.', fieldErrors }, 400);
  }
  const data = parsed.data;

  const turnstileSecret = env.TURNSTILE_SECRET;
  const isVerified = await verifyTurnstileToken(data.turnstileToken, turnstileSecret, clientAddress);
  if (!isVerified) {
    return jsonResponse({ ok: false, error: 'Verification failed. Please try again.' }, 400);
  }

  const licenseFile = formData.get('license');
  const insuranceFile = formData.get('insuranceCard');
  if (!(licenseFile instanceof File) || licenseFile.size === 0) {
    return jsonResponse(
      { ok: false, error: 'Please upload a photo of your driver’s license.', fieldErrors: { license: ['Required'] } },
      400,
    );
  }
  if (!(insuranceFile instanceof File) || insuranceFile.size === 0) {
    return jsonResponse(
      {
        ok: false,
        error: 'Please upload a photo of your insurance card.',
        fieldErrors: { insuranceCard: ['Required'] },
      },
      400,
    );
  }
  for (const [file, cap] of [
    [licenseFile, MAX_LICENSE_BYTES],
    [insuranceFile, MAX_INSURANCE_BYTES],
  ] as const) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return jsonResponse({ ok: false, error: 'Uploads must be photos (JPG, PNG, WEBP, or HEIC).' }, 400);
    }
    if (file.size > cap) {
      return jsonResponse({ ok: false, error: 'One of your photos is too large. Please try again.' }, 400);
    }
  }

  const submissionId = crypto.randomUUID();
  const attachments: { filename: string; content: string }[] = [];
  let licenseAttached = false;
  let insuranceCardAttached = false;

  for (const [role, file] of [
    ['license', licenseFile],
    ['insurance-card', insuranceFile],
  ] as const) {
    const buffer = await file.arrayBuffer();
    const extension = file.type.split('/')[1] ?? 'bin';
    const key = `rentals/${submissionId}/${role}.${extension}`;

    try {
      await env.QUOTE_PHOTOS.put(key, buffer, {
        httpMetadata: { contentType: file.type },
      });
      attachments.push({ filename: `${role}.${extension}`, content: Buffer.from(buffer).toString('base64') });
      if (role === 'license') licenseAttached = true;
      else insuranceCardAttached = true;
    } catch (err) {
      console.error('Failed to upload rental file to R2', err);
    }
  }

  const owner = ownerRentalNotificationEmail(data, { licenseAttached, insuranceCardAttached });
  const resendApiKey = env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);

      await resend.emails.send({
        from: `${business.name} Rentals <${env.QUOTE_FROM_EMAIL}>`,
        to: env.OWNER_NOTIFICATION_EMAIL,
        replyTo: data.email,
        subject: owner.subject,
        html: owner.html,
        text: owner.text,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      const confirmation = customerRentalConfirmationEmail(data);
      await resend.emails.send({
        from: `${business.name} <${env.QUOTE_FROM_EMAIL}>`,
        to: data.email,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
      });
    } catch (err) {
      console.error('Failed to send rental email via Resend', err);
      return jsonResponse(
        {
          ok: false,
          error: 'We saved your request but the confirmation email failed to send. Please call us to confirm.',
        },
        502,
      );
    }
  } else {
    // No RESEND_API_KEY configured (e.g. fresh local checkout) - log instead of failing,
    // so the demo/mockup still completes successfully end to end.
    console.info('[rental] RESEND_API_KEY not set - logging submission instead of emailing.', {
      submissionId,
      ...data,
      turnstileToken: undefined,
    });
  }

  return jsonResponse({ ok: true, submissionId });
};
