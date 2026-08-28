import { defineMiddleware } from 'astro:middleware';

const CANONICAL_HOST = 'budgetautosrepair.com';

function requestHostname(request: Request, url: URL): string {
  const forwarded = request.headers.get('x-forwarded-host');
  const hostHeader = request.headers.get('host');
  const raw = forwarded ?? hostHeader ?? url.host;
  return raw.split(',')[0].trim().split(':')[0].toLowerCase();
}

export const onRequest = defineMiddleware(({ request, url }, next) => {
  const host = requestHostname(request, url);
  const isPreview =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.localhost') ||
    host.endsWith('.workers.dev') ||
    host.endsWith('.trycloudflare.com');

  if (isPreview) return next();

  const nextUrl = new URL(url);
  let redirect = false;

  if (host === `www.${CANONICAL_HOST}`) {
    nextUrl.hostname = CANONICAL_HOST;
    redirect = true;
  }

  if (url.protocol === 'http:') {
    nextUrl.protocol = 'https:';
    redirect = true;
  }

  const legacy = url.pathname.replace(/\/+$/, '') || '/';
  if (legacy === '/book-online') {
    nextUrl.hostname = CANONICAL_HOST;
    nextUrl.pathname = '/book';
    redirect = true;
  }

  // Keep in sync with scripts/canonical-worker-entry.mjs, which owns the same
  // normalisation for prerendered pages. Page routes are canonical with a
  // trailing slash; API routes and files with an extension are left alone.
  const current = nextUrl.pathname;
  if (!current.startsWith('/api/') && current !== '/') {
    if (current.endsWith('/index.html')) {
      nextUrl.pathname = current.slice(0, -'index.html'.length);
      redirect = true;
    } else if (/\/{2,}$/.test(current)) {
      nextUrl.pathname = current.replace(/\/+$/, '/');
      redirect = true;
    } else if (!/\.[^/]+$/.test(current) && !current.endsWith('/')) {
      nextUrl.pathname = current + '/';
      redirect = true;
    }
  }

  if (redirect) {
    return Response.redirect(nextUrl.toString(), 301);
  }

  return next();
});
