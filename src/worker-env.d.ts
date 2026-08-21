/**
 * Secrets available on the Workers `env` object.
 *
 * `wrangler types` generates worker-configuration.d.ts from wrangler.jsonc, so
 * it only knows about bindings and the non-secret `vars`. Secrets are set with
 * `wrangler secret put` and deliberately never appear in that file, which left
 * every `env.RESEND_API_KEY` style read as a type error. Declaring them here
 * keeps them typed, and this file is committed - worker-configuration.d.ts is
 * gitignored and regenerated, so anything added there would be wiped.
 *
 * Typed as `string` rather than `string | undefined` to match how the API routes
 * use them: they are read straight into helpers that take a string and treat an
 * empty value as "not configured" at runtime. Keep every entry documented in
 * .dev.vars.example.
 */
declare namespace Cloudflare {
  interface Env {
    /** Resend transactional email. Absent locally means "log instead of send". */
    RESEND_API_KEY: string;
    /** Cloudflare Turnstile secret, paired with PUBLIC_TURNSTILE_SITE_KEY. */
    TURNSTILE_SECRET: string;
    /** Google Gemini key for the chat assistant. */
    GEMINI_API_KEY: string;
    /** Cal.com API key for the /book appointment calendar. */
    CAL_API_KEY: string;
  }
}

interface Env extends Cloudflare.Env {}
