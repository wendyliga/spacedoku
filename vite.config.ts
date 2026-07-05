import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const FALLBACK_SITE_URL = 'https://spacedoku.wendyliga.com/';

function trailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

function siteUrl(): string {
  const raw =
    process.env.VITE_SITE_URL ||
    process.env.CF_PAGES_URL ||
    process.env.URL ||
    FALLBACK_SITE_URL;

  try {
    return trailingSlash(new URL(raw).toString());
  } catch {
    return FALLBACK_SITE_URL;
  }
}

// base './' so the built site works from any subdirectory on a static host
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'spacedoku-social-meta',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          const canonicalUrl = siteUrl();
          const imageUrl = new URL('og-image.png', canonicalUrl).toString();
          const domain = new URL(canonicalUrl).host;

          return html
            .replaceAll('__SITE_URL__', canonicalUrl)
            .replaceAll('__SITE_DOMAIN__', domain)
            .replaceAll('__OG_IMAGE_URL__', imageUrl);
        },
      },
    },
  ],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: false,
  },
});
