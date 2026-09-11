/**
 * Canonical-URL rules shared by the production Worker entry (see
 * canonical-worker-entry.mjs, which copies this file into dist/server) and
 * src/middleware.ts (dev server / on-demand routes). One implementation, so the
 * two can never drift apart again.
 *
 * Canonical form: https://budgetautosrepair.com/<path>/  (apex host, https,
 * trailing slash on page routes). API routes and files with an extension are
 * left alone.
 */

export const CANONICAL_HOST = 'budgetautosrepair.com';

/**
 * URLs from the previous Wix site (it lived on www.budgetautosrepair.com) that
 * Google still has in its index. Map them to the closest new page so the old
 * URL's history transfers instead of dying as a 404.
 *
 * `exact` matches the path with any trailing slash removed. `prefix` matches
 * the start of the path (Wix nests booking and service pages under these).
 * Add rows here as Search Console surfaces more legacy URLs.
 */
export const LEGACY_REDIRECTS = {
  exact: {
    '/book-online': '/book/',
    '/bookings-checkout': '/book/',
  },
  prefix: [
    ['/book-online/', '/book/'],
    ['/service-page/', '/services/'],
  ],
};

/**
 * Routes rendered on demand (prerender = false). They have no file in the asset
 * bundle, so the Worker's asset probe cannot see them - list them here so the
 * trailing-slash 301 still fires for them.
 */
export const ON_DEMAND_PAGES = new Set(['/book/', '/thank-you/']);

export function isPreviewHost(host) {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.localhost') ||
    host.endsWith('.workers.dev') ||
    host.endsWith('.trycloudflare.com')
  );
}

const HAS_EXTENSION = /\.[^/]+$/;

/**
 * Work out where a request should be 301'd to.
 *
 * @param {string | URL} requestUrl
 * @param {{ pageExists?: (pathWithSlash: string) => Promise<boolean> | boolean }} [options]
 *   `pageExists` lets the caller confirm that the trailing-slash form of a path
 *   is a real page before redirecting to it. Without it, a request for a URL
 *   that does not exist would 301 to its slash form and only then 404 - a
 *   pointless hop that wastes crawl budget on every dead legacy URL.
 * @returns {Promise<string | null>} the canonical URL, or null if already canonical
 */
export async function canonicalTarget(requestUrl, options = {}) {
  const url = new URL(requestUrl);
  const host = url.hostname.toLowerCase();

  // Local dev and workers.dev previews serve whatever host they were asked for.
  if (isPreviewHost(host)) return null;

  let changed = false;

  if (host === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST;
    changed = true;
  }

  if (url.protocol === 'http:') {
    url.protocol = 'https:';
    changed = true;
  }

  let path = url.pathname;

  const legacyKey = path.replace(/\/+$/, '') || '/';
  if (LEGACY_REDIRECTS.exact[legacyKey]) {
    path = LEGACY_REDIRECTS.exact[legacyKey];
    changed = true;
  } else {
    for (const [from, to] of LEGACY_REDIRECTS.prefix) {
      if (path.startsWith(from)) {
        path = to;
        changed = true;
        break;
      }
    }
  }

  if (!path.startsWith('/api/') && path !== '/_image' && path !== '/_image/' && path !== '/') {
    if (path.endsWith('/index.html')) {
      path = path.slice(0, -'index.html'.length);
      changed = true;
    }
    if (/\/{2,}/.test(path)) {
      path = path.replace(/\/{2,}/g, '/');
      changed = true;
    }
    if (!HAS_EXTENSION.test(path) && !path.endsWith('/')) {
      const withSlash = `${path}/`;
      const exists = options.pageExists ? await options.pageExists(withSlash) : true;
      if (exists) {
        path = withSlash;
        changed = true;
      }
    }
  }

  if (!changed) return null;
  url.pathname = path;
  return url.toString();
}
