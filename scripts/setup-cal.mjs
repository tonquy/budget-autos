#!/usr/bin/env node
// Provisions one Cal.com event type per advertised service.
//
// Idempotent: run it again after changing a duration below and it patches the
// existing event types instead of creating duplicates.
//
//   node scripts/setup-cal.mjs --dry-run
//   node scripts/setup-cal.mjs
//
// Reads CAL_API_KEY from the environment, or from .dev.vars if present.
//
// Doing this over the API rather than clicking through the Cal.com UI seven
// times means the shop's calendar configuration is reproducible, and that the
// lead-time rule can't end up set to 3 days on six services and 1 on the
// seventh.
//
// APPOINTMENTS below is a deliberate copy of `serviceAppointments` in
// src/lib/booking.ts, which stays the source of truth for the running site.
// A plain .mjs ops script can't import a .ts module without a build step, and
// adding one for a script that runs a handful of times isn't worth it. The
// verify step at the end of this script fails loudly if the two ever drift.

import { readFileSync } from 'node:fs';

const API_BASE = 'https://api.cal.com/v2';
const API_VERSION = '2024-06-14';

const SHOP_ADDRESS = '2344 Airport Rd, Johnson City, NY 13790';
const BOOKING_LEAD_DAYS = 3;

const APPOINTMENTS = [
  { slug: 'diagnostics', name: 'Engine Diagnostics', durationMinutes: 60 },
  { slug: 'engine-maintenance', name: 'Engine Maintenance & Repair', durationMinutes: 90 },
  { slug: 'brake-services', name: 'Brake Services', durationMinutes: 90 },
  { slug: 'suspension-alignment', name: 'Suspension & Alignment', durationMinutes: 90 },
  { slug: 'electrical-systems', name: 'Electrical Systems', durationMinutes: 60 },
  { slug: 'presale-inspection', name: 'Presale Inspection', durationMinutes: 60 },
  { slug: 'general-repairs', name: 'General Repairs', durationMinutes: 60 },
];

const dryRun = process.argv.includes('--dry-run');

function readApiKey() {
  const fromEnv = process.env.CAL_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  try {
    const match = /^CAL_API_KEY=(.+)$/m.exec(readFileSync('.dev.vars', 'utf8'));
    return match?.[1]?.trim() || null;
  } catch {
    return null;
  }
}

const apiKey = readApiKey();
if (!apiKey) {
  console.error(
    'CAL_API_KEY is not set. Create one at Cal.com > Settings > Security > API keys,\n' +
      'then export it or add it to .dev.vars.',
  );
  process.exit(1);
}

/**
 * Cal.com's own notice is a backstop only. The authoritative rule is the
 * whole-day check in src/lib/booking.ts, which the slots and booking endpoints
 * both apply. See the BOOKING_LEAD_DAYS comment there for why days beat hours.
 */
const minimumBookingNotice = BOOKING_LEAD_DAYS * 24 * 60;

async function call(method, path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'cal-api-version': API_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const raw = await response.text();
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    /* non-JSON error bodies are reported raw by the caller */
  }
  return { ok: response.ok, status: response.status, body: parsed, raw };
}

/** Fails loudly if this script's copy of the service list has drifted from booking.ts. */
function verifyAgainstSource() {
  let source;
  try {
    source = readFileSync(new URL('../src/lib/booking.ts', import.meta.url), 'utf8');
  } catch {
    console.warn('Could not read src/lib/booking.ts to cross-check durations - skipping.\n');
    return;
  }

  const problems = [];
  for (const appointment of APPOINTMENTS) {
    const pattern = new RegExp(`['"]?${appointment.slug}['"]?\\s*:\\s*(\\d+)`);
    const match = pattern.exec(source);
    if (!match) {
      problems.push(`${appointment.slug} is not in booking.ts`);
    } else if (Number(match[1]) !== appointment.durationMinutes) {
      problems.push(
        `${appointment.slug}: this script says ${appointment.durationMinutes}min, booking.ts says ${match[1]}min`,
      );
    }
  }

  const leadMatch = /BOOKING_LEAD_DAYS\s*=\s*(\d+)/.exec(source);
  if (leadMatch && Number(leadMatch[1]) !== BOOKING_LEAD_DAYS) {
    problems.push(`lead time: this script says ${BOOKING_LEAD_DAYS} days, booking.ts says ${leadMatch[1]}`);
  }

  if (problems.length > 0) {
    console.error('This script has drifted from src/lib/booking.ts:\n');
    for (const problem of problems) console.error(`  - ${problem}`);
    console.error('\nReconcile them before provisioning, or the site and the calendar will disagree.');
    process.exit(1);
  }
}

async function listEventTypes() {
  const result = await call('GET', '/event-types');
  if (!result.ok) {
    console.error(`Could not list event types (HTTP ${result.status}): ${result.raw}`);
    process.exit(1);
  }
  const data = Array.isArray(result.body?.data) ? result.body.data : [];
  return new Map(data.map((eventType) => [eventType.slug, eventType]));
}

function payloadFor(appointment) {
  return {
    title: `${appointment.name} - Budget Auto Repair`,
    slug: `budget-auto-${appointment.slug}`,
    lengthInMinutes: appointment.durationMinutes,
    description: `${appointment.name} appointment at Budget Auto Repair, ${SHOP_ADDRESS}.`,
    minimumBookingNotice,
    // The customer is dropping a vehicle off, so the location is the shop.
    locations: [{ type: 'inPerson', address: SHOP_ADDRESS, public: true }],
    disableGuests: true,
  };
}

verifyAgainstSource();

console.log(
  `Provisioning ${APPOINTMENTS.length} event types (lead time ${BOOKING_LEAD_DAYS} days)` +
    `${dryRun ? ' [dry run]' : ''}\n`,
);

const existing = dryRun ? new Map() : await listEventTypes();
let failures = 0;

for (const appointment of APPOINTMENTS) {
  const payload = payloadFor(appointment);
  const found = existing.get(payload.slug);
  const label = `${payload.slug} (${appointment.durationMinutes}min)`;

  if (dryRun) {
    console.log(`would provision  ${label}`);
    continue;
  }

  const result = found
    ? await call('PATCH', `/event-types/${found.id}`, payload)
    : await call('POST', '/event-types', payload);

  if (result.ok) {
    console.log(`${found ? 'patched' : 'created'}  ${label}`);
  } else {
    failures += 1;
    console.error(`failed   ${label} - HTTP ${result.status}: ${result.raw}`);
  }
}

if (!dryRun) {
  console.log(
    '\nNext, in the Cal.com dashboard:\n' +
      '  1. Connect Google Calendar so the owner sees bookings on his phone.\n' +
      '  2. Set the availability schedule to Mon-Fri 9:00-17:00, America/New_York.\n' +
      '  3. Turn off the attendee confirmation email, so customers only get the\n' +
      '     branded one this site sends via Resend.\n',
  );
}

process.exit(failures > 0 ? 1 : 0);
