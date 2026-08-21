// Appointment scheduling: the 3-day lead-time rule, the shop's bookable hours,
// and the Cal.com client used to read availability and write bookings.
//
// Cal.com is the calendar of record. It owns the real availability (including
// anything the owner blocks off from his phone) and syncs to his Google
// Calendar. This file is the shop's own rules layered on top of it.

import { services } from './business';

/**
 * Every date calculation in this file is done in the shop's timezone, never the
 * server's. Workers run in UTC, so `new Date().getDate()` on a Cloudflare edge
 * node is already tomorrow for five hours every evening in New York - long
 * enough to hand a customer a slot the shop hasn't left itself time to prepare
 * for.
 */
export const SHOP_TIMEZONE = 'America/New_York';

/**
 * How many days after today are blocked out, so the shop always has time to
 * order parts and plan the bay before a vehicle arrives.
 *
 * The rule, in the client's own example: a customer visiting on the 20th sees
 * the 21st, 22nd, and 23rd as unavailable, and the 24th is the first date they
 * can pick. So the earliest bookable date is today + BOOKING_LEAD_DAYS + 1.
 *
 * This is deliberately expressed in whole calendar days rather than as a number
 * of hours. Cal.com's own `minimumBookingNotice` is measured in minutes from
 * right now, which would make the boundary drift with the time of day: a 72-hour
 * notice offers a sliver of the 23rd to someone browsing at 9am and none of it
 * to someone browsing at 6pm. Whole days keep the calendar identical no matter
 * when the customer looks at it.
 */
export const BOOKING_LEAD_DAYS = 3;

/** How far ahead the calendar will show dates. */
export const BOOKING_WINDOW_DAYS = 60;

/** Minutes past midnight, shop time, that each weekday is open for booking. */
const SHOP_SCHEDULE: Record<number, { open: number; close: number } | undefined> = {
  0: undefined, // Sunday - closed
  1: { open: 9 * 60, close: 17 * 60 },
  2: { open: 9 * 60, close: 17 * 60 },
  3: { open: 9 * 60, close: 17 * 60 },
  4: { open: 9 * 60, close: 17 * 60 },
  5: { open: 9 * 60, close: 17 * 60 },
  // Saturday is "by appointment only" per business.hours, so it stays off the
  // online calendar and the owner adds those visits himself.
  6: undefined,
};

/** Spacing between offered start times. */
const SLOT_INTERVAL_MINUTES = 30;

export type ServiceAppointment = {
  /** Matches the service slug in business.ts. */
  slug: string;
  name: string;
  /** The Cal.com event type slug this service books into. */
  eventTypeSlug: string;
  /**
   * How long the bay is held. An alignment and a presale inspection are not the
   * same appointment, so these differ per service rather than using one generic
   * length that is wrong for most of them.
   */
  durationMinutes: number;
};

const DURATIONS: Record<string, number> = {
  diagnostics: 60,
  'engine-maintenance': 90,
  'brake-services': 90,
  'suspension-alignment': 90,
  'electrical-systems': 60,
  'presale-inspection': 60,
  'general-repairs': 60,
};

/**
 * One bookable appointment type per advertised service, derived from the same
 * `services` array the rest of the site renders from. Adding a service in
 * business.ts adds it to the booking flow automatically; only the duration and
 * the matching Cal.com event type need creating.
 */
export const serviceAppointments: ServiceAppointment[] = services.map((service) => ({
  slug: service.slug,
  name: service.name,
  eventTypeSlug: `budget-auto-${service.slug}`,
  durationMinutes: DURATIONS[service.slug] ?? 60,
}));

export function getAppointmentBySlug(slug: string): ServiceAppointment | undefined {
  return serviceAppointments.find((appointment) => appointment.slug === slug);
}

// --- Shop-timezone date helpers -------------------------------------------------

/** A calendar date in the shop's timezone, as `YYYY-MM-DD`. */
export type DateKey = string;

/** Today's date in the shop's timezone. */
export function shopDateKey(instant: Date = new Date()): DateKey {
  // en-CA formats as YYYY-MM-DD, which is what we want to compare as strings.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SHOP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

export function addDays(key: DateKey, days: number): DateKey {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Day of week (0 = Sunday) for a shop-timezone calendar date. */
export function weekdayOf(key: DateKey): number {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!)).getUTCDay();
}

/**
 * The first date a customer is allowed to book. Everything from today through
 * today + BOOKING_LEAD_DAYS is off the table.
 */
export function earliestBookableDate(now: Date = new Date()): DateKey {
  return addDays(shopDateKey(now), BOOKING_LEAD_DAYS + 1);
}

/** The last date the calendar will offer. */
export function latestBookableDate(now: Date = new Date()): DateKey {
  return addDays(shopDateKey(now), BOOKING_WINDOW_DAYS);
}

/** True when the shop is open for online booking on this date. */
export function isOpenOn(key: DateKey): boolean {
  return SHOP_SCHEDULE[weekdayOf(key)] !== undefined;
}

/**
 * The authoritative lead-time check. Used by the slots endpoint to build the
 * calendar and again by the booking endpoint before anything is written, because
 * a disabled button in the UI is only a suggestion - the API is what has to
 * actually refuse.
 */
export function isDateBookable(key: DateKey, now: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  if (key < earliestBookableDate(now)) return false;
  if (key > latestBookableDate(now)) return false;
  return isOpenOn(key);
}

/**
 * The offset of the shop's timezone at a given instant, in minutes. Positive is
 * east of UTC. Read from the Intl database rather than hardcoded so the DST
 * switch is handled without a code change twice a year.
 */
function shopOffsetMinutes(instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOP_TIMEZONE,
    timeZoneName: 'longOffset',
  }).formatToParts(instant);

  const name = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!match) return 0;

  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

/** Converts a wall-clock time on a shop-timezone date into a real instant. */
export function shopTimeToInstant(key: DateKey, minutesFromMidnight: number): Date {
  const [year, month, day] = key.split('-').map(Number);
  // Probe at midday UTC: US DST changes happen at 2am local, which is always
  // well before midday UTC on the same calendar date, so this lands on the
  // correct side of the transition.
  const probe = new Date(Date.UTC(year!, month! - 1, day!, 12));
  const offset = shopOffsetMinutes(probe);
  return new Date(Date.UTC(year!, month! - 1, day!, 0, minutesFromMidnight - offset));
}

/** The shop-timezone date a given instant falls on. */
export function instantToDateKey(instant: Date): DateKey {
  return shopDateKey(instant);
}

export function formatTimeForShop(instant: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: SHOP_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(instant);
}

export function formatDateForShop(instant: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: SHOP_TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(instant);
}

export function formatAppointmentForShop(instant: Date): string {
  return `${formatDateForShop(instant)} at ${formatTimeForShop(instant)}`;
}

// --- Slot generation -----------------------------------------------------------

/**
 * The slots the shop's own hours allow on a date, as ISO instants. This is the
 * shape of the day before Cal.com's real availability is applied; the API route
 * intersects it with what Cal.com reports as actually free.
 */
export function slotsForDate(key: DateKey, durationMinutes: number): string[] {
  const hours = SHOP_SCHEDULE[weekdayOf(key)];
  if (!hours) return [];

  const slots: string[] = [];
  // The appointment has to finish before closing, so the last start is pulled
  // back by its own duration rather than running past 5pm.
  const lastStart = hours.close - durationMinutes;
  for (let minutes = hours.open; minutes <= lastStart; minutes += SLOT_INTERVAL_MINUTES) {
    slots.push(shopTimeToInstant(key, minutes).toISOString());
  }
  return slots;
}

/**
 * True when an instant is a real start time on the shop's grid - open weekday,
 * on the half hour, and early enough that the appointment finishes by closing.
 *
 * The booking route uses this to reject a slot that was never on offer, which a
 * hand-crafted POST could otherwise smuggle in (5:30pm on a Sunday, say).
 */
export function isSlotWithinShopHours(iso: string, durationMinutes: number): boolean {
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) return false;
  return slotsForDate(instantToDateKey(instant), durationMinutes).includes(instant.toISOString());
}

export type DayAvailability = {
  date: DateKey;
  /** ISO start times still open on this date. */
  slots: string[];
};

/**
 * Every bookable date in the window with the slots the shop's hours allow.
 * Dates inside the lead-time buffer are omitted entirely - the UI renders them
 * as visibly unavailable from the `earliestDate` it is given, rather than
 * needing them listed here.
 */
export function buildLocalAvailability(durationMinutes: number, now: Date = new Date()): DayAvailability[] {
  const days: DayAvailability[] = [];
  const start = earliestBookableDate(now);
  const end = latestBookableDate(now);

  for (let key = start; key <= end; key = addDays(key, 1)) {
    if (!isOpenOn(key)) continue;
    days.push({ date: key, slots: slotsForDate(key, durationMinutes) });
  }
  return days;
}

// --- Cal.com client ------------------------------------------------------------

const CAL_API_BASE = 'https://api.cal.com/v2';

// Cal.com versions its contracts per endpoint family via this header. Pinning
// both explicitly means a change on their side can't silently reshape our
// responses.
const CAL_SLOTS_VERSION = '2024-09-04';
const CAL_BOOKINGS_VERSION = '2024-08-13';

export type CalConfig = {
  apiKey: string;
  username: string;
};

/**
 * Reads the Cal.com credentials, or null when they aren't configured.
 *
 * Null is a supported state, not a crash: without it the booking flow still
 * works off the shop's published hours and still emails both parties, exactly
 * like /api/quote degrades without a Resend key. That keeps a fresh checkout
 * and the client demo working. Production should always have it set - see
 * docs/BOOKING_SETUP.md.
 */
export function getCalConfig(env: { CAL_API_KEY?: string; CAL_USERNAME?: string }): CalConfig | null {
  const apiKey = env.CAL_API_KEY?.trim();
  const username = env.CAL_USERNAME?.trim();
  if (!apiKey || !username) return null;
  return { apiKey, username };
}

function calHeaders(config: CalConfig, version: string): Record<string, string> {
  return {
    Authorization: `Bearer ${config.apiKey}`,
    'cal-api-version': version,
    'Content-Type': 'application/json',
  };
}

/**
 * Pulls the ISO start times out of a Cal.com slots response.
 *
 * Written defensively on purpose. Across API versions Cal.com has returned the
 * day map keyed under `data` directly and nested under `data.slots`, with the
 * time on either a `start` or a `time` field. Walking the payload for whichever
 * is present costs little and means a version bump doesn't empty the calendar.
 */
function extractSlotTimes(payload: unknown): string[] {
  const found: string[] = [];

  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (!node || typeof node !== 'object') return;

    const record = node as Record<string, unknown>;
    const time = record.start ?? record.time;
    if (typeof time === 'string' && !Number.isNaN(Date.parse(time))) {
      found.push(new Date(time).toISOString());
      return;
    }
    for (const value of Object.values(record)) visit(value);
  };

  visit(payload);
  return found;
}

/**
 * Asks Cal.com which slots are genuinely free for an event type in a date range.
 * Returns null (rather than an empty list) when the lookup fails, so callers can
 * tell "Cal.com says nothing is free" apart from "Cal.com didn't answer" and
 * fall back instead of showing a wrongly empty calendar.
 */
export async function fetchCalSlots(
  config: CalConfig,
  eventTypeSlug: string,
  startDate: DateKey,
  endDate: DateKey,
): Promise<string[] | null> {
  const url = new URL(`${CAL_API_BASE}/slots`);
  url.searchParams.set('eventTypeSlug', eventTypeSlug);
  url.searchParams.set('username', config.username);
  url.searchParams.set('start', startDate);
  url.searchParams.set('end', endDate);
  url.searchParams.set('timeZone', SHOP_TIMEZONE);

  try {
    const response = await fetch(url, { headers: calHeaders(config, CAL_SLOTS_VERSION) });
    if (!response.ok) {
      console.error('Cal.com slots lookup failed', response.status, await response.text());
      return null;
    }
    return extractSlotTimes(await response.json());
  } catch (err) {
    console.error('Cal.com slots lookup threw', err);
    return null;
  }
}

export type CalBookingRequest = {
  eventTypeSlug: string;
  /** ISO instant for the start of the appointment. */
  start: string;
  name: string;
  email: string;
  phone?: string;
  /** Free-text notes shown to the shop on the calendar entry. */
  notes?: string;
};

export type CalBookingResult =
  | { ok: true; uid: string | null }
  | { ok: false; reason: 'slot-taken' | 'error'; message: string };

/**
 * Books the slot in Cal.com. A 4xx that mentions availability is reported as
 * `slot-taken` so the customer gets "someone just took that time, pick another"
 * instead of a generic failure - that's a normal race between two people on the
 * calendar, not a bug.
 */
export async function createCalBooking(
  config: CalConfig,
  request: CalBookingRequest,
): Promise<CalBookingResult> {
  const body = {
    start: request.start,
    eventTypeSlug: request.eventTypeSlug,
    username: config.username,
    attendee: {
      name: request.name,
      email: request.email,
      timeZone: SHOP_TIMEZONE,
      phoneNumber: request.phone || undefined,
      language: 'en',
    },
    bookingFieldsResponses: request.notes ? { notes: request.notes } : undefined,
  };

  try {
    const response = await fetch(`${CAL_API_BASE}/bookings`, {
      method: 'POST',
      headers: calHeaders(config, CAL_BOOKINGS_VERSION),
      body: JSON.stringify(body),
    });

    const text = await response.text();

    if (!response.ok) {
      const looksTaken =
        response.status === 400 || response.status === 409
          ? /no longer available|already booked|not available|slot/i.test(text)
          : false;

      console.error('Cal.com booking failed', response.status, text);
      return looksTaken
        ? {
            ok: false,
            reason: 'slot-taken',
            message: 'That time was just booked by someone else. Please pick another slot.',
          }
        : { ok: false, reason: 'error', message: 'We could not confirm that appointment.' };
    }

    let uid: string | null = null;
    try {
      const parsed = JSON.parse(text) as { data?: { uid?: string } };
      uid = parsed.data?.uid ?? null;
    } catch {
      // A 2xx with an unparseable body still means the booking landed.
    }
    return { ok: true, uid };
  } catch (err) {
    console.error('Cal.com booking threw', err);
    return { ok: false, reason: 'error', message: 'We could not reach the scheduling system.' };
  }
}
