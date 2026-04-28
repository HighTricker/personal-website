// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://lujiaqi.top',
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  },

  server: {
    host: true,
    port: 4321,
  },
});