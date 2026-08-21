# Budget Auto Repair - Website

A marketing site + "get a quote" system for an independent auto repair shop, built with Astro,
Tailwind CSS, and Preact, deployed on Cloudflare Workers.

This is currently a **demo mockup** with placeholder branding, copy, and contact details.
Everything content-related lives in one file (see below) so it's a quick swap once the client sends
real information.

## What's here

- Homepage, Services, and a guided "Get a Quote" intake wizard with photo/video upload
- Pricing is quote-only - nothing listed on the site; customers request a quote and the shop replies
- A working `/api/quote` backend: validates the form, verifies a Cloudflare Turnstile challenge,
  stores any uploaded photos in an R2 bucket, and emails the shop owner via Resend (with the photos
  attached directly to the email, plus an optional confirmation email to the customer)
- A live appointment calendar at `/book`: pick a service, pick a slot, get an instant confirmation.
  Backed by Cal.com, with a 3-day lead time so the shop always has time to prepare for the vehicle.
  See [`docs/BOOKING_SETUP.md`](docs/BOOKING_SETUP.md).
- No admin dashboard and no database of our own - by design. Quote and chat leads are managed from
  the email notification on the owner's phone; appointments are managed in Cal.com, which syncs to
  his Google Calendar.

## Swapping in real content

Almost everything customer-facing lives in [`src/lib/business.ts`](src/lib/business.ts): shop name,
phone number, address, hours, warranty language, service list + starting prices, and testimonials.
Update that one file and the whole site updates.

The two photos used on the homepage (`src/assets/images/`) are AI-generated placeholders standing in
for real shop photos - swap them for photos of the actual shop/team before launch.

## Local development

```sh
npm install
npm run dev
```

Open `http://localhost:4321`.

### Local secrets

Two files hold local-only configuration (both gitignored, both already populated with safe
defaults so the site works out of the box):

- **`.env`** - `PUBLIC_TURNSTILE_SITE_KEY`, the public Cloudflare Turnstile site key
  (`0x4AAAAAAD7eom-KB1HZ1Qex`) for the real widget.
- **`.dev.vars`** - `TURNSTILE_SECRET` (the matching Turnstile secret), `GEMINI_API_KEY` (chat),
  `RESEND_API_KEY`, and `CAL_API_KEY` (booking calendar). Without a real Resend key, `/api/quote`
  logs the full submission to the terminal instead of emailing it, so the quote form still works
  end-to-end for a demo. Without a Cal.com key, `/book` generates slots from the shop's published
  hours instead of live availability - see [`docs/BOOKING_SETUP.md`](docs/BOOKING_SETUP.md).

`.env.example` and `.dev.vars.example` document the same variables for a fresh checkout.

## Going live (for whoever deploys this for the client)

1. **Domain & branding** - update `site` in [`astro.config.mjs`](astro.config.mjs) to the real
   domain, and replace the content in `business.ts` and the placeholder images.
2. **Cloudflare R2** - create the bucket referenced in [`wrangler.jsonc`](wrangler.jsonc):
   ```sh
   npx wrangler r2 bucket create budget-auto-repair-quote-photos
   ```
3. **Resend** - create a Resend account + verified sending domain, then set the production secret:
   ```sh
   npx wrangler secret put RESEND_API_KEY
   ```
4. **Cloudflare Turnstile** - the real widget (site key `0x4AAAAAAD7eom-KB1HZ1Qex`) is already wired:
   - `PUBLIC_TURNSTILE_SITE_KEY` holds the site key (in your production `.env` / build config)
   - set the real secret: `npx wrangler secret put TURNSTILE_SECRET`
5. **Owner/from email addresses** - live: both `OWNER_NOTIFICATION_EMAIL` and `QUOTE_FROM_EMAIL`
   in `wrangler.jsonc` are `info@budgetautosrepair.com`, sent from the Resend-verified
   `budgetautosrepair.com` domain. Quote and chat leads both land in that inbox.
6. **Cal.com booking calendar** - create the account, provision the per-service event types, and
   set the secret. Full walkthrough in [`docs/BOOKING_SETUP.md`](docs/BOOKING_SETUP.md):
   ```sh
   node scripts/setup-cal.mjs --dry-run   # then without the flag
   npx wrangler secret put CAL_API_KEY
   ```
   `CAL_USERNAME` lives in `wrangler.jsonc` under `vars` - update it to the real Cal.com username.
7. **Deploy:**
   ```sh
   npm run build
   npx wrangler deploy
   ```

## Commands

| Command                  | Action                                               |
| :------------------------ | :--------------------------------------------------- |
| `npm install`             | Install dependencies                                  |
| `npm run dev`              | Start the local dev server at `localhost:4321`        |
| `npm run build`            | Build the production site to `./dist/`                |
| `npm run preview`          | Preview the build locally using the real Workers runtime |
| `npm run generate-types`   | Regenerate `worker-configuration.d.ts` after changing `wrangler.jsonc` |
| `npm run setup:cal`        | Provision the Cal.com event types for `/book` (add `-- --dry-run` first) |
| `npm run verify:booking`   | Check the 3-day lead time, shop hours, and DST handling for `/book` |
| `npx wrangler deploy`      | Deploy to Cloudflare Workers                          |

## Stack

Astro (server output) - Tailwind CSS v4 - Preact (for the interactive quote and booking islands) -
Zod (form validation) - Cloudflare Workers, R2, and Turnstile - Resend (email) - Cal.com (booking
calendar)
