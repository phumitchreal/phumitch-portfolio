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
  integrations: [
    react(),
    // /love is a private gift page (noindex) — keep it out of the sitemap.
    sitemap({ filter: (page) => !page.includes("/love") }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
