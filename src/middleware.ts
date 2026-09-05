import { defineMiddleware } from 'astro:middleware';
import { canonicalTarget } from '../scripts/canonical-redirect.mjs';

function requestUrl(request: Request, url: URL): URL {
  // Behind a proxy the public host arrives in x-forwarded-host.
  const forwarded = request.headers.get('x-forwarded-host');
  if (!forwarded) return url;
  const publicUrl = new URL(url);
  publicUrl.host = forwarded.split(',')[0].trim();
  return publicUrl;
}

/**
 * In production the Worker entry (scripts/canonical-worker-entry.mjs) applies
 * these same rules before Astro sees the request, so this only matters for the
 * dev server and as a safety net for on-demand routes. Rules live in
 * scripts/canonical-redirect.mjs - edit them there, not here.
 */
export const onRequest = defineMiddleware(async ({ request, url }, next) => {
  const target = await canonicalTarget(requestUrl(request, url));
  if (target) return Response.redirect(target, 301);
  return next();
});
