// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Production origin. Makes canonical and hreflang URLs absolute for SEO.
  site: "https://eczane.apphane.dev",
  i18n: {
    defaultLocale: 'tr',
    locales: ['tr', 'en', 'ru'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  server: {
    host: true,
    allowedHosts: ['apphane.exe.xyz'],
  },
});
