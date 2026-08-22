import { access, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CANONICAL_HOST = 'budgetautosrepair.com';

const WRAPPER = `import astro from './astro-entry.mjs';

const CANONICAL_HOST = '${CANONICAL_HOST}';

function canonicalRedirect(request) {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  let redirect = false;

  if (host === \`www.\${CANONICAL_HOST}\`) {
    url.hostname = CANONICAL_HOST;
    redirect = true;
  }

  if (url.protocol === 'http:') {
    url.protocol = 'https:';
    redirect = true;
  }

  const path = url.pathname.replace(/\\/+$/, '') || '/';
  if (path === '/book-online') {
    url.hostname = CANONICAL_HOST;
    url.pathname = '/book';
    redirect = true;
  }

  if (!redirect) return null;
  return Response.redirect(url.toString(), 301);
}

export default {
  fetch(request, env, ctx) {
    const redirected = canonicalRedirect(request);
    if (redirected) return redirected;
    return astro.fetch(request, env, ctx);
  },
};
`;

/**
 * Astro's Cloudflare adapter serves prerendered HTML as static assets before
 * middleware runs. This wraps the generated Worker entry so www → apex 301s
 * happen on every request, including those static pages.
 */
export function canonicalHostWorkerEntry() {
  return {
    name: 'canonical-host-worker-entry',
    hooks: {
      'astro:build:done': async () => {
        const serverDir = path.join(process.cwd(), 'dist/server');
        const entryPath = path.join(serverDir, 'entry.mjs');
        const innerPath = path.join(serverDir, 'astro-entry.mjs');
        await access(entryPath);
        await rename(entryPath, innerPath);
        await writeFile(entryPath, WRAPPER);
      },
    },
  };
}
