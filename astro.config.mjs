// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

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
    preact(),
    sitemap({
      filter: (page) => !page.includes('/thank-you') && !page.includes('/404'),
    }),
  ],
});