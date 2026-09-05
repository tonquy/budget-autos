import { access, copyFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WRAPPER = `import astro from './astro-entry.mjs';
import {
  CANONICAL_HOST,
  ON_DEMAND_PAGES,
  canonicalTarget,
  isPreviewHost,
} from './canonical-redirect.mjs';

// A path "exists" if it is an on-demand route or the asset bundle has a file
// for it (HEAD against the ASSETS binding is a cheap local lookup). Unknown
// paths are left alone so they 404 straight away instead of 301 → 404.
async function pageExists(pathWithSlash, request, env) {
  if (ON_DEMAND_PAGES.has(pathWithSlash)) return true;
  if (!env?.ASSETS) return true;
  const probe = new URL(pathWithSlash, request.url);
  const response = await env.ASSETS.fetch(new Request(probe, { method: 'HEAD' }));
  return response.ok;
}

export default {
  async fetch(request, env, ctx) {
    const target = await canonicalTarget(request.url, {
      pageExists: (pathWithSlash) => pageExists(pathWithSlash, request, env),
    });
    if (target) return Response.redirect(target, 301);

    const response = await astro.fetch(request, env, ctx);

    // The *.workers.dev hostname (and any other non-canonical host that reaches
    // this Worker) must never be indexed as a copy of the site.
    const host = new URL(request.url).hostname.toLowerCase();
    if (host !== CANONICAL_HOST && isPreviewHost(host)) {
      const headers = new Headers(response.headers);
      headers.set('X-Robots-Tag', 'noindex, nofollow');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  },
};
`;

/**
 * Astro's Cloudflare adapter serves prerendered HTML as static assets before
 * middleware runs. This wraps the generated Worker entry so the canonical-URL
 * 301s - www to apex, http to https, legacy Wix URLs, and the trailing-slash
 * form - happen on every request, including those static pages. The rules
 * themselves live in canonical-redirect.mjs, shared with src/middleware.ts.
 */
export function canonicalHostWorkerEntry() {
  return {
    name: 'canonical-host-worker-entry',
    hooks: {
      'astro:build:done': async () => {
        const serverDir = path.join(process.cwd(), 'dist/server');
        const entryPath = path.join(serverDir, 'entry.mjs');
        const innerPath = path.join(serverDir, 'astro-entry.mjs');
        const rulesSource = fileURLToPath(new URL('./canonical-redirect.mjs', import.meta.url));
        await access(entryPath);
        await rename(entryPath, innerPath);
        await copyFile(rulesSource, path.join(serverDir, 'canonical-redirect.mjs'));
        await writeFile(entryPath, WRAPPER);
      },
    },
  };
}
