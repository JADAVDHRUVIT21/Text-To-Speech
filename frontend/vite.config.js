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

      includeAssets: ["favicon.png", "pwa-192x192.png", "pwa-512x512.png"],

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
        cleanupOutdatedCaches: true,

        // Precache built assets (JS, CSS, icons) + the HTML shell
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],

        // Fallback: serve /index.html for any navigation route
        navigateFallback: "/index.html",

        // Never let the SW handle API calls
        navigateFallbackDenylist: [/^\/api\//],

        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],
});