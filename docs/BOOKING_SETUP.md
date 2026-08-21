# Appointment booking setup

The booking flow at `/book` uses **Cal.com** as the calendar of record. Cal.com owns
real availability and syncs to the owner's Google Calendar, so he can block a day
off from his phone without anyone touching code. This site owns the shop's rules
on top of it: the 3-day lead time, the service list, and the customer-facing
confirmation email.

## Why Cal.com

- The lead-time rule is a first-class feature (`minimumBookingNotice`), so blocked
  dates are genuinely unbookable rather than just greyed out in the browser.
- The owner gets a dashboard and two-way Google Calendar sync. This was the
  deciding factor over storing bookings ourselves in D1, which would have left him
  with no way to see or change the schedule.
- The free individual plan covers a single-calendar shop. Creating a booking is a
  public endpoint and slot lookups accept `username` + `eventTypeSlug`, so the
  paid Platform tier is not required for what this site does.

## One-time setup

### 1. Create the account and the API key

1. Sign up at [cal.com](https://cal.com) as the shop (one user is enough).
2. Note the username - it becomes `CAL_USERNAME`.
3. Create an API key under **Settings > Security > API keys**. It looks like
   `cal_live_...`. This is `CAL_API_KEY`.

### 2. Provision the event types

One Cal.com event type per advertised service, each with its own duration:

```sh
node scripts/setup-cal.mjs --dry-run   # show what would change
node scripts/setup-cal.mjs             # create or patch all seven
```

The script is idempotent and reads `CAL_API_KEY` from the environment or from
`.dev.vars`. It cross-checks its durations against `src/lib/booking.ts` and
refuses to run if the two have drifted, so the site and the calendar can't end up
disagreeing about how long a brake job takes.

Durations, matching `DURATIONS` in [`src/lib/booking.ts`](../src/lib/booking.ts):

| Service | Cal.com event type | Length |
| :--- | :--- | :--- |
| Engine Diagnostics | `budget-auto-diagnostics` | 60 min |
| Engine Maintenance & Repair | `budget-auto-engine-maintenance` | 90 min |
| Brake Services | `budget-auto-brake-services` | 90 min |
| Suspension & Alignment | `budget-auto-suspension-alignment` | 90 min |
| Electrical Systems | `budget-auto-electrical-systems` | 60 min |
| Presale Inspection | `budget-auto-presale-inspection` | 60 min |
| General Repairs | `budget-auto-general-repairs` | 60 min |

### 3. Finish in the Cal.com dashboard

Three things the API does not cover:

1. **Connect Google Calendar**, so bookings land on the owner's phone.
2. **Set the availability schedule** to Mon-Fri 9:00-17:00, `America/New_York`,
   matching `business.hours`. Saturday stays off the online calendar because
   `business.hours` lists it as "by appointment only" - the owner adds those
   himself.
3. **Turn off the attendee confirmation email.** This site sends its own branded
   confirmation through Resend, and two different-looking emails for one booking
   is confusing. Leave the *host* notification on, so the owner still gets the
   calendar invite.

### 4. Set the secrets

Local (`.dev.vars`):

```
CAL_API_KEY=cal_live_xxxxx
```

Local `CAL_USERNAME` and production non-secrets live in `wrangler.jsonc` under
`vars`. Production secret:

```sh
npx wrangler secret put CAL_API_KEY
```

## How the 3-day rule works

`BOOKING_LEAD_DAYS` in [`src/lib/booking.ts`](../src/lib/booking.ts) is `3`. A
customer visiting on the 20th sees the 21st, 22nd, and 23rd as unavailable, and
the 24th is the first date they can pick.

The rule is expressed in **whole calendar days in the shop's timezone**, not in
hours. Cal.com's `minimumBookingNotice` counts minutes from right now, which
would make the boundary drift with the time of day - a 72-hour notice offers part
of the 23rd to someone browsing at 9am and none of it to someone browsing at 6pm.
Whole days keep the calendar identical no matter when the customer looks.

It is enforced in three places, deliberately:

1. **The UI** greys out blocked dates (`BookingFlow.tsx`).
2. **`/api/slots`** never returns a slot inside the buffer.
3. **`/api/booking`** re-checks before writing anything. This is the one that
   matters - the first two are conveniences, and a hand-crafted POST would sail
   past both.

Cal.com's own `minimumBookingNotice` is set to 72 hours by the setup script as a
backstop in case someone books through a Cal.com link directly.

Weekends need no special handling: because only Mon-Fri slots exist, a customer
visiting on a Friday is offered the following Wednesday, and the buffer never
lands them on a day the shop is shut.

## Urgent work

The calendar shows a persistent "need it sooner?" line pointing at the phone and
text links. This is load-bearing. `business.ts` promises same-day diagnostics,
priority scheduling for safety work, and same-day batteries, and a customer with
failing brakes is the highest-intent lead the shop gets. Without that line the
calendar quietly turns them away. If the 3-day rule is ever changed, revisit the
copy in `business.ts` at the same time.

## Testing the flow locally

Every form on the site, including `/book`, verifies a Cloudflare Turnstile token
server-side. To submit one locally you need a **matching pair** of test keys - a
production site key checked against a test secret fails, and it surfaces only as
"Verification failed. Please try again." on submit:

```sh
# .env
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
# .dev.vars
TURNSTILE_SECRET=1x0000000000000000000000000000000AA
```

Both are Cloudflare's public "always passes" test keys. Remove the `.env` entry
before building for production - `PUBLIC_TURNSTILE_SITE_KEY` is inlined at build
time, so a test key left in place would ship a captcha that anyone can walk past.

To check the date rules without waiting for the calendar to roll over:

```sh
npm run verify:booking
```

That exercises the real `src/lib/booking.ts` against the awkward cases: a Friday
visitor, the DST boundary, and a late-evening visitor whose UTC date has already
rolled over to tomorrow.

## Running without Cal.com

If `CAL_API_KEY` or `CAL_USERNAME` is missing, the booking flow still works: slots
are generated from the shop's published hours and both emails still send. This
mirrors how `/api/quote` degrades without a Resend key, and keeps a fresh checkout
and the client demo working end to end.

The tradeoff is that nothing is reserved, so two customers could pick the same
time. Production should always have both variables set. The `/api/slots` response
includes `"source": "local"` when running in this mode.
