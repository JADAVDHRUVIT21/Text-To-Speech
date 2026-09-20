import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      // Don't cache the HTML shell aggressively — let it always revalidate.
      // This ensures fresh app code after deploys and stable storage.
      includeAssets: ["pwa-192x192.png", "pwa-512x512.png"],

      manifest: {
        name: "Text-to-Speech Application",
        short_name: "Text-to-Speech",
        description: "A modern multilingual text-to-speech application",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        // Keep old caches cleaned up, but never touch localStorage / IndexedDB
        cleanupOutdatedCaches: true,

        // Cache only static assets — NOT the HTML, NOT the API
        globPatterns: ["**/*.{js,css,ico,png,svg,woff,woff2}"],

        // NEVER cache API calls
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],

        runtimeCaching: [
          // API calls → always network, never cache
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: "NetworkOnly",
          },
          // HTML navigation → network first, fall back to cache only if offline
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],

        // Do not precache the HTML entry
        // (prevents the app from loading a stale HTML that has no token)
        dontCacheBustURLsMatching: /\.\w{8}\./,
      },

      devOptions: {
        enabled: false, // keep SW off during local dev
      },
    }),
  ],
});