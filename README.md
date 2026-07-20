# Budget Auto Repair - Website

A marketing site + "get a quote" system for an independent auto repair shop, built with Astro,
Tailwind CSS, and Preact, deployed on Cloudflare Workers.

This is currently a **demo mockup** with placeholder branding, copy, pricing, and contact details.
Everything content-related lives in one file (see below) so it's a quick swap once the client sends
real information.

## What's here

- Homepage, Services & pricing, and a unified "Get a Quote" page with photo upload
- A working `/api/quote` backend: validates the form, verifies a Cloudflare Turnstile challenge,
  stores any uploaded photos in an R2 bucket, and emails the shop owner via Resend (with the photos
  attached directly to the email, plus an optional confirmation email to the customer)
- No admin dashboard, no database, no live booking calendar - by design. The owner manages
  everything from the email notification on their phone, and calls the customer back to confirm.

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

- **`.env`** - `PUBLIC_TURNSTILE_SITE_KEY`, currently set to Cloudflare's public "always passes"
  Turnstile test site key.
- **`.dev.vars`** - `TURNSTILE_SECRET_KEY` (matching test secret key) and `RESEND_API_KEY` (left
  blank). Without a real Resend key, `/api/quote` logs the full submission to the terminal instead
  of emailing it, so the quote form still works end-to-end for a demo.

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
4. **Cloudflare Turnstile** - create a real Turnstile widget in the Cloudflare dashboard, then:
   - put the real site key in `PUBLIC_TURNSTILE_SITE_KEY` (in your production `.env` / build config)
   - set the real secret: `npx wrangler secret put TURNSTILE_SECRET_KEY`
5. **Owner/from email addresses** - update `OWNER_NOTIFICATION_EMAIL` and `QUOTE_FROM_EMAIL` in
   `wrangler.jsonc` (the `QUOTE_FROM_EMAIL` domain must be verified in Resend).
6. **Deploy:**
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
| `npx wrangler deploy`      | Deploy to Cloudflare Workers                          |

## Stack

Astro (server output) - Tailwind CSS v4 - Preact (for the interactive quote form island) - Zod
(form validation) - Cloudflare Workers, R2, and Turnstile - Resend (email)
