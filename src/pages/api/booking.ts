import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';
import { z } from 'zod';
import { business } from '../../lib/business';
import {
  createCalBooking,
  earliestBookableDate,
  fetchCalSlots,
  formatDateForShop,
  getAppointmentBySlug,
  getCalConfig,
  instantToDateKey,
  isDateBookable,
  isOpenOn,
  isSlotWithinShopHours,
  shopTimeToInstant,
} from '../../lib/booking';
import { bookingSchema } from '../../lib/bookingSchema';
import { customerBookingConfirmationEmail, ownerBookingNotificationEmail } from '../../lib/emailTemplates';
import { verifyTurnstileToken } from '../../lib/turnstile';

export const prerender = false;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ ok: false, error: 'Could not read submission.' }, 400);
  }

  const getStr = (key: string) => String(formData.get(key) ?? '');

  const raw = {
    serviceSlug: getStr('serviceSlug'),
    slotStart: getStr('slotStart'),
    name: getStr('name'),
    phone: getStr('phone'),
    email: getStr('email'),
    vehicleYear: getStr('vehicleYear'),
    vehicleMake: getStr('vehicleMake'),
    vehicleModel: getStr('vehicleModel'),
    mileage: getStr('mileage'),
    notes: getStr('notes'),
    turnstileToken: getStr('turnstileToken'),
    company: getStr('company'),
  };

  // Honeypot: real visitors never populate this hidden field.
  if (raw.company) {
    return jsonResponse({ ok: true });
  }

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return jsonResponse({ ok: false, error: 'Please check the form and try again.', fieldErrors }, 400);
  }
  const data = parsed.data;

  const isVerified = await verifyTurnstileToken(data.turnstileToken, env.TURNSTILE_SECRET, clientAddress);
  if (!isVerified) {
    return jsonResponse({ ok: false, error: 'Verification failed. Please try again.' }, 400);
  }

  const appointment = getAppointmentBySlug(data.serviceSlug);
  if (!appointment) {
    return jsonResponse({ ok: false, error: 'Unknown service.' }, 400);
  }

  const start = new Date(data.slotStart);
  const now = new Date();

  /*
   * The lead-time rule is re-checked here rather than trusted from the client.
   * The greyed-out dates in the calendar and the filtering in /api/slots are
   * both conveniences for an honest browser; this is the check that actually
   * refuses a POST aimed at tomorrow.
   */
  const startDateKey = instantToDateKey(start);
  if (!isDateBookable(startDateKey, now)) {
    // Split the two reasons apart: "we're shut that day" and "that's too soon"
    // need different answers. Telling someone the earliest date is Monday when
    // they asked for a Sunday just reads as broken.
    const error = isOpenOn(startDateKey)
      ? `The earliest appointment we can take is ${formatDateForShop(
          shopTimeToInstant(earliestBookableDate(now), 12 * 60),
        )}. Please pick a later date, or call us if it's urgent.`
      : 'We are closed that day. Please pick a weekday, or call us if it\u2019s urgent.';

    return jsonResponse(
      { ok: false, error, fieldErrors: { slotStart: ['Pick a date we have open.'] } },
      400,
    );
  }

  // Also confirm it is a slot the shop actually offers, so a crafted request
  // can't land at 5:30pm or in the middle of an existing appointment.
  if (!isSlotWithinShopHours(start.toISOString(), appointment.durationMinutes)) {
    return jsonResponse(
      {
        ok: false,
        error: 'That is not one of our appointment times. Please pick a slot from the calendar.',
        fieldErrors: { slotStart: ['Pick a time from the calendar.'] },
      },
      400,
    );
  }

  const vehicle = [data.vehicleYear, data.vehicleMake, data.vehicleModel]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' ');

  const noteLines = [
    `Service: ${appointment.name}`,
    vehicle ? `Vehicle: ${vehicle}` : '',
    data.mileage ? `Mileage: ${data.mileage}` : '',
    `Phone: ${data.phone}`,
    data.notes ? `\n${data.notes}` : '',
  ].filter(Boolean);

  const config = getCalConfig(env);
  let bookingRef: string | null = null;
  let reserved = false;

  if (config) {
    // Last-moment availability check. Cal.com rejects a taken slot anyway, but
    // asking first lets us return the friendlier "just taken" message in the
    // common case instead of parsing an error body for it.
    const stillFree = await fetchCalSlots(config, appointment.eventTypeSlug, startDateKey, startDateKey);
    if (stillFree && !stillFree.includes(start.toISOString())) {
      return jsonResponse(
        {
          ok: false,
          error: 'That time was just booked by someone else. Please pick another slot.',
          slotTaken: true,
        },
        409,
      );
    }

    const result = await createCalBooking(config, {
      eventTypeSlug: appointment.eventTypeSlug,
      start: start.toISOString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      notes: noteLines.join('\n'),
    });

    if (!result.ok) {
      return jsonResponse(
        { ok: false, error: result.message, slotTaken: result.reason === 'slot-taken' },
        result.reason === 'slot-taken' ? 409 : 502,
      );
    }

    bookingRef = result.uid;
    reserved = true;
  } else {
    // No Cal.com credentials: the appointment is not reserved on a real
    // calendar, so it is emailed through and the owner confirms. Mirrors how
    // /api/quote degrades without a Resend key. See docs/BOOKING_SETUP.md.
    console.warn(
      '[booking] Cal.com is not configured - emailing the appointment without reserving it.',
      { service: appointment.slug, start: start.toISOString() },
    );
  }

  const emailPayload = {
    appointmentName: appointment.name,
    durationMinutes: appointment.durationMinutes,
    start,
    name: data.name,
    phone: data.phone,
    email: data.email,
    vehicle,
    mileage: data.mileage ?? '',
    notes: data.notes ?? '',
    bookingRef,
    reserved,
  };

  const resendApiKey = env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const owner = ownerBookingNotificationEmail(emailPayload);

      await resend.emails.send({
        from: `${business.name} Bookings <${env.QUOTE_FROM_EMAIL}>`,
        to: env.OWNER_NOTIFICATION_EMAIL,
        replyTo: data.email,
        subject: owner.subject,
        html: owner.html,
        text: owner.text,
      });

      const confirmation = customerBookingConfirmationEmail(emailPayload);
      await resend.emails.send({
        from: `${business.name} <${env.QUOTE_FROM_EMAIL}>`,
        to: data.email,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
      });
    } catch (err) {
      /*
       * The appointment is already on the calendar at this point, so this is not
       * a failed booking - losing the email must not tell the customer their slot
       * didn't take. Report it as booked-but-unconfirmed instead.
       */
      console.error('Failed to send booking email via Resend', err);
      return jsonResponse({
        ok: true,
        bookingRef,
        emailFailed: true,
        error: 'Your appointment is booked, but the confirmation email failed to send.',
      });
    }
  } else {
    // Fresh local checkout with no Resend key - log so the flow still completes.
    console.info('[booking] RESEND_API_KEY not set - logging booking instead of emailing.', {
      ...emailPayload,
      start: start.toISOString(),
    });
  }

  return jsonResponse({ ok: true, bookingRef });
};
