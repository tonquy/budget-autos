// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { canonicalHostWorkerEntry } from './scripts/canonical-worker-entry.mjs';

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

  adapter: cloudflare(),
  integrations: [
    canonicalHostWorkerEntry(),
    preact(),
    sitemap({
      // /book is SSR (prerender = false), so the crawler will not discover it
      // from the static build. Add it by hand so Google can find the page.
      customPages: ['https://budgetautosrepair.com/book'],
      filter: (page) =>
        !page.includes('/thank-you') &&
        !page.includes('/404') &&
        page !== 'https://budgetautosrepair.com/book/',
    }),
  ],
});