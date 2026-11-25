// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: "https://phumitch.space",
  redirects: {
    '/studio_lol': '/',
  },
  // The girlfriend page is noindex and shared privately — keep it out of the sitemap.
  integrations: [react(), sitemap({ filter: (page) => !page.includes("/mygirlfirends") })],
  vite: {
    plugins: [tailwindcss()],
  },
});
