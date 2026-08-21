import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import {
  BOOKING_LEAD_DAYS,
  SHOP_TIMEZONE,
  buildLocalAvailability,
  earliestBookableDate,
  fetchCalSlots,
  getAppointmentBySlug,
  getCalConfig,
  instantToDateKey,
  isDateBookable,
  latestBookableDate,
  shopDateKey,
  type DayAvailability,
} from '../../lib/booking';

export const prerender = false;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // Availability changes as bookings come in, so this must never be held by
      // a shared cache. A stale calendar sends two customers at the same slot.
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * Availability for one service, as the calendar UI needs it.
 *
 * Proxied rather than called from the browser so the Cal.com key stays server
 * side, and so the lead-time buffer is applied before the dates ever reach the
 * client.
 */
export const GET: APIRoute = async ({ url }) => {
  const serviceSlug = url.searchParams.get('service') ?? '';
  const appointment = getAppointmentBySlug(serviceSlug);

  if (!appointment) {
    return jsonResponse({ ok: false, error: 'Unknown service.' }, 400);
  }

  const now = new Date();
  const earliest = earliestBookableDate(now);
  const latest = latestBookableDate(now);

  // What the shop's own published hours allow, before real bookings are removed.
  const localDays = buildLocalAvailability(appointment.durationMinutes, now);
  const config = getCalConfig(env);

  let days: DayAvailability[] = localDays;
  let source: 'cal.com' | 'local' = 'local';

  if (config) {
    const calSlots = await fetchCalSlots(config, appointment.eventTypeSlug, earliest, latest);

    // A null result means Cal.com didn't answer, which is different from Cal.com
    // saying nothing is free. Falling back to published hours keeps the shop
    // bookable during an outage rather than showing an empty calendar.
    if (calSlots) {
      source = 'cal.com';
      const byDate = new Map<string, string[]>();

      for (const iso of calSlots) {
        const instant = new Date(iso);
        const dateKey = instantToDateKey(instant);
        // Cal.com's own notice setting is a backstop that counts hours from now,
        // so re-apply our whole-day rule here - it is the authoritative one.
        if (!isDateBookable(dateKey, now)) continue;

        const list = byDate.get(dateKey) ?? [];
        list.push(instant.toISOString());
        byDate.set(dateKey, list);
      }

      days = [...byDate.entries()]
        .map(([date, slots]) => ({ date, slots: slots.sort() }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }
  }

  // Drop days that ended up with nothing free so the UI can render them as full.
  const available = days.filter((day) => day.slots.length > 0);

  return jsonResponse({
    ok: true,
    source,
    service: { slug: appointment.slug, name: appointment.name, durationMinutes: appointment.durationMinutes },
    timeZone: SHOP_TIMEZONE,
    leadDays: BOOKING_LEAD_DAYS,
    // Today at the shop, so the calendar can tell a past date apart from one
    // that is genuinely full. The visitor's own clock can't be trusted for this.
    today: shopDateKey(now),
    earliestDate: earliest,
    latestDate: latest,
    days: available,
  });
};
