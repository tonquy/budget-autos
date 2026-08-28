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

  const legacy = url.pathname.replace(/\\/+$/, '') || '/';
  if (legacy === '/book-online') {
    url.hostname = CANONICAL_HOST;
    url.pathname = '/book';
    redirect = true;
  }

  // Page routes are canonical with a trailing slash - that is the form the
  // sitemap lists, the form the canonical tags emit, and the form the static
  // build writes to disk. Without this, /privacy and /privacy/ both return
  // 200 and Google is free to index whichever one it happens to find first.
  // API routes are left alone, and so is anything with a file extension.
  const current = url.pathname;
  if (!current.startsWith('/api/') && current !== '/') {
    if (current.endsWith('/index.html')) {
      url.pathname = current.slice(0, -'index.html'.length);
      redirect = true;
    } else if (/\\/{2,}$/.test(current)) {
      url.pathname = current.replace(/\\/+$/, '/');
      redirect = true;
    } else if (!/\\.[^/]+$/.test(current) && !current.endsWith('/')) {
      url.pathname = current + '/';
      redirect = true;
    }
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
 * middleware runs. This wraps the generated Worker entry so the canonical-URL
 * 301s - www to apex, http to https, and the trailing-slash form - happen on
 * every request, including those static pages.
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
