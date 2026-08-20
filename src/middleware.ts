import { defineMiddleware } from 'astro:middleware';

const CANONICAL_HOST = 'budgetautosrepair.com';

export const onRequest = defineMiddleware(({ url }, next) => {
  const host = url.hostname;
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

  if (redirect) {
    return Response.redirect(nextUrl.toString(), 301);
  }

  return next();
});
