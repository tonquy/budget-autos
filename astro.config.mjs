// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  output: 'server',
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: cloudflare(),
  integrations: [preact(), sitemap()]
});