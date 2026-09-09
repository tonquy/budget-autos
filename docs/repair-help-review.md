# Repair help content: local review

Implemented on `codex/repair-help-content`; the user approved pushing the complete change set on September 9, 2026. Includes the user-provided transparent Photoroom logo, replacing the previous logo assets.

Local preview: http://localhost:4323/blog/ . It runs `npm run preview -- --background --port 4323`, serving the built app through Astro’s local Cloudflare runtime. Use `npm exec astro -- preview status`, `preview logs`, or `preview stop` to manage it. Rebuild and restart the preview after future code edits.

The installed Astro development server returned 404s for client hydration modules, including the renderer, so the final handoff uses the supported built-app preview instead. No framework workaround or deployment configuration change was retained. The second-opinion form was confirmed hydrated in this preview; server-side submissions still require the production integrations.

## Review these pages

- `/blog/`: a question-based index covering all 20 client questions.
- `/second-opinion/`: estimate review, comparison, repair priorities, and a photo-upload request form.
- `/`: new repair-question links below the trust section.
- Existing service pages: links to the relevant guides and second opinions.

Nine new articles cover misfires, no-starts, overheating, fluid leaks, general vibration, inside/uneven tire wear, repair-versus-replace decisions, repair before selling/trading, and rental requests. Existing check-engine, brake, and alignment articles were rewritten at their original URLs. Other existing articles remain accessible from the index.

Article pages now use topic-specific descriptions and service links, related reading, and an automatically generated table of contents. Removed the generic HowTo structured data that described quote intake rather than the article. Article, breadcrumb, and visible FAQ structured data remain. New pages enter the existing sitemap automatically. Calendar dates display in UTC to prevent date-only frontmatter appearing a day early locally.

The second-opinion form reuses the existing quote endpoint and attachment handling with `flow=estimate-review`; the general quote form retains `unknown-intake`. Photos and screenshots are supported, not PDFs. No live inquiry, booking, rental, or email was submitted during verification.

## Client review before publication

- Have the shop review the technical advice and confirm that it accurately describes their inspection and estimate-review practice. No technician-review credential is claimed on the site.
- Confirm rental terms. The draft repeats the existing rental form's $35/day and 100 included miles per day, explicitly subject to availability and eligibility. It does not invent deposits, excess-mileage charges, or insurance coverage.
- Confirm the date of publication if release occurs after this local draft date (September 9, 2026).
- Add photographs of the actual permanent Budget Autos Repair sign once available. No new sign or Google Business Profile change is represented as completed.

Primary references are linked beside the relevant safety advice: AAA check-engine and maintenance guidance, Ford coolant and warning-light instructions, Bridgestone tire safety guidance, and Firestone brake/alignment technical guidance. General guidance cannot establish whether an individual vehicle is safe to drive.

## Validation

- Production build passed.
- Astro check passed with no errors or warnings after running the project's existing `generate-types` command (one pre-existing script hint).
- Built HTML checked for one H1, canonical URLs, valid JSON-LD, sitemap inclusion, and internal links/anchors. 1,098 internal links checked with no failures.
- Browser review covered the hub, second-opinion form, article, and homepage on desktop/phone layouts. No horizontal overflow on inspected pages.
- No live form submission or production integration test; this preview does not have the production secrets configured.

## Search monitoring after publication

 Use Search Console to inspect the new URLs and monitor problem-based queries. Compare inquiry and booking outcomes with traffic; existing contact-click attributes are preserved/added to the main calls to action. Query attribution and completed-appointment reporting should be verified against the live analytics setup before drawing conversion conclusions.
