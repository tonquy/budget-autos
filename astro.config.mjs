// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { canonicalHostWorkerEntry } from './scripts/canonical-worker-entry.mjs';
import { isIndexableLocation, locations } from './src/lib/locations.ts';

/**
 * Only URLs that are meant to rank belong in the sitemap. Submitting noindex or
 * near-duplicate pages just spends this new domain's small crawl budget on URLs
 * Google will not index anyway.
 *
 * @param {string} page absolute URL of a page the sitemap integration found
 * @returns {boolean}
 */
function isSitemapPage(page) {
  const { pathname } = new URL(page);
  if (pathname.includes('/thank-you') || pathname.includes('/404')) return false;
  // Per-service quote forms are noindex - they are one short form each.
  if (/^\/quote\/[^/]+\/$/.test(pathname)) return false;
  const city = pathname.match(/^\/locations\/([^/]+)\/$/)?.[1];
  if (city) {
    const location = locations.find((entry) => entry.slug === city);
    if (location && !isIndexableLocation(location)) return false;
  }
  return true;
}

// https://astro.build/config
export default defineConfig({
  site: 'https://budgetautosrepair.com',
  output: 'server',
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: 'optimize-cloudflare-ssr-deps',
        configEnvironment(environment) {
          if (environment === 'client') return;
          return {
            optimizeDeps: {
              include: [
                '@astrojs/cloudflare/entrypoints/server',
                'astro/zod',
                'preact/devtools',
              ],
            },
          };
        },
      },
    ],
  },

  // Prebuild responsive images so visitors fetch cached files, not runtime transforms.
  adapter: cloudflare({ imageService: { build: 'compile', runtime: 'cloudflare-binding' } }),
  integrations: [
    canonicalHostWorkerEntry(),
    preact(),
    sitemap({
      // /book is SSR (prerender = false), so the crawler will not discover it
      // from the static build. Add it by hand so Google can find the page.
      // Trailing slash to match every other URL in the sitemap and the 301
      // the Worker entry issues for /book.
      customPages: ['https://budgetautosrepair.com/book/'],
      filter: isSitemapPage,
    }),
  ],
});