// Checks the lead-time and shop-hours rules against the real src/lib/booking.ts.
//
// Run with:  node scripts/verify-booking-rules.mjs
//
// The interesting cases are the ones you cannot reach by waiting for the clock:
// a Friday visitor rolling into the following week, the DST boundary, and a
// late-evening visitor whose UTC date has already rolled over to tomorrow.
// That last one is the bug this whole file exists to prevent - Workers run in
// UTC, so "today" on the server is not "today" at the shop after 8pm Eastern.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'booking-verify-'));
const bundle = join(dir, 'booking.mjs');

execFileSync(
  'node_modules/.bin/esbuild',
  ['src/lib/booking.ts', '--bundle', '--format=esm', '--platform=neutral', `--outfile=${bundle}`],
  { stdio: 'pipe' },
);

const {
  BOOKING_LEAD_DAYS,
  earliestBookableDate,
  isDateBookable,
  isSlotWithinShopHours,
  shopDateKey,
  shopTimeToInstant,
  slotsForDate,
  serviceAppointments,
} = await import(bundle);

let failures = 0;
function check(label, actual, expected) {
  const ok = String(actual) === String(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? 'pass' : 'FAIL'}  ${label}`);
  if (!ok) console.log(`        expected ${expected}, got ${actual}`);
}

console.log(`Lead days: ${BOOKING_LEAD_DAYS}\n`);

// --- The client's own example -------------------------------------------------
console.log('The stated rule: visiting on the 20th, the 21st-23rd are blocked and the 24th is open');
const aug20 = new Date('2026-08-20T15:00:00Z');
check('earliest bookable date from Thu Aug 20', earliestBookableDate(aug20), '2026-08-24');
for (const blocked of ['2026-08-20', '2026-08-21', '2026-08-22', '2026-08-23']) {
  check(`  ${blocked} is blocked`, isDateBookable(blocked, aug20), 'false');
}
check('  2026-08-24 is bookable', isDateBookable('2026-08-24', aug20), 'true');

// --- Friday, rolling over a weekend -----------------------------------------
console.log('\nA Friday visitor: buffer covers Sat/Sun/Mon, and Mon is shut anyway');
const fri = new Date('2026-08-21T15:00:00Z'); // Friday
check('earliest date from Fri Aug 21', earliestBookableDate(fri), '2026-08-25');
check('  Sat 2026-08-22 blocked', isDateBookable('2026-08-22', fri), 'false');
check('  Sun 2026-08-23 blocked', isDateBookable('2026-08-23', fri), 'false');
check('  Mon 2026-08-24 blocked (inside buffer)', isDateBookable('2026-08-24', fri), 'false');
check('  Tue 2026-08-25 bookable', isDateBookable('2026-08-25', fri), 'true');

// --- Weekends are never bookable --------------------------------------------
console.log('\nWeekends are never offered, however far out');
check('Sat 2026-09-12 not bookable', isDateBookable('2026-09-12', aug20), 'false');
check('Sun 2026-09-13 not bookable', isDateBookable('2026-09-13', aug20), 'false');
check('Mon 2026-09-14 bookable', isDateBookable('2026-09-14', aug20), 'true');

// --- The UTC rollover trap ---------------------------------------------------
console.log('\nLate evening in New York, when the UTC date has already rolled over');
// 2026-08-20 23:30 EDT is 2026-08-21 03:30 UTC. A naive server would think it
// is already the 21st and offer the 25th, quietly moving the goalposts.
const lateEvening = new Date('2026-08-21T03:30:00Z');
check('shop date at 11:30pm EDT is still the 20th', shopDateKey(lateEvening), '2026-08-20');
check('earliest date is still Aug 24, not 25', earliestBookableDate(lateEvening), '2026-08-24');

// --- DST ---------------------------------------------------------------------
console.log('\nDST: 9am shop time is a different UTC instant either side of the change');
// EDT (UTC-4) in summer, EST (UTC-5) in winter.
check('9am on 2026-07-15 (EDT) is 13:00Z', shopTimeToInstant('2026-07-15', 540).toISOString(), '2026-07-15T13:00:00.000Z');
check('9am on 2026-12-15 (EST) is 14:00Z', shopTimeToInstant('2026-12-15', 540).toISOString(), '2026-12-15T14:00:00.000Z');

// --- Shop hours grid ---------------------------------------------------------
console.log('\nAppointments finish by 5pm, so the last start is pulled back by the duration');
check('60min: 15 slots, last start 4:00pm (20:00Z)', slotsForDate('2026-08-24', 60).length, 15);
check('  last 60min start', slotsForDate('2026-08-24', 60).at(-1), '2026-08-24T20:00:00.000Z');
check('90min: 14 slots, last start 3:30pm (19:30Z)', slotsForDate('2026-08-24', 90).length, 14);
check('  last 90min start', slotsForDate('2026-08-24', 90).at(-1), '2026-08-24T19:30:00.000Z');

console.log('\nCrafted times the API must refuse');
check('5:30pm start for a 90min job', isSlotWithinShopHours('2026-08-24T21:30:00.000Z', 90), 'false');
check('9:07am (off the half-hour grid)', isSlotWithinShopHours('2026-08-24T13:07:00.000Z', 90), 'false');
check('9am on a Sunday', isSlotWithinShopHours('2026-08-23T13:00:00.000Z', 90), 'false');
check('9am on a Monday (valid)', isSlotWithinShopHours('2026-08-24T13:00:00.000Z', 90), 'true');

console.log(`\nEvery advertised service has an appointment type: ${serviceAppointments.length}`);
for (const appointment of serviceAppointments) {
  console.log(`  ${appointment.slug} -> ${appointment.eventTypeSlug} (${appointment.durationMinutes}min)`);
}

rmSync(dir, { recursive: true, force: true });

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
