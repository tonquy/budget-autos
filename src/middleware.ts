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

  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (path === '/book-online') {
    nextUrl.hostname = CANONICAL_HOST;
    nextUrl.pathname = '/book';
    redirect = true;
  }

  if (redirect) {
    return Response.redirect(nextUrl.toString(), 301);
  }

  return next();
});
