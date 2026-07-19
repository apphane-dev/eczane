// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
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
