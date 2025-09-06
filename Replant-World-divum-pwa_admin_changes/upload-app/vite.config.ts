import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 7011,
    strictPort: true,
    hmr: {
      host: 'localhost',
      clientPort: 7011,
      protocol: 'ws',
    },
  },
  plugins: [
    tsconfigPaths(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Disable SW during Vite dev to avoid HMR/WebSocket conflicts
      devOptions: { enabled: false },
      includeAssets: [
        'favicon-32x32.png',
        'apple-touch-icon.png',
        '**/*.png',
        '**/*.jpg',
        '**/*.jpeg',
        '**/*.svg',
        '**/*.webp',
        '**/*.ico',
      ],
      manifest: {
        name: 'Replant World',
        short_name: 'Replant World',
        start_url: '/',
        display: 'standalone',
        lang: 'en',
        scope: '/',
        description:
          'Capture, monitor and verify your tree planting with Poptech, Replant World’s proof of planting technology.',
        theme_color: '#1b3233',
        background_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshot-dashboard.jpg',
            sizes: '360x740',
            type: 'image/jpeg',
            form_factor: 'narrow',
          },
          {
            src: '/screenshot-capture.jpg',
            sizes: '360x740',
            type: 'image/jpeg',
            form_factor: 'narrow',
          },
          {
            src: '/screenshot-dashboard-wide.jpg',
            sizes: '1024x768',
            type: 'image/jpeg',
            form_factor: 'wide',
          },
          {
            src: '/screenshot-capture-wide.jpg',
            sizes: '1024x768',
            type: 'image/jpeg',
            form_factor: 'wide',
          },
        ],
      },
      workbox: {
        globDirectory: 'dist', // Point to the build output directory
        globPatterns: [
          '**/*.{css,html,js,tsx,json,png,jpg,jpeg,svg,webp,webmanifest,ico}', // Cache all relevant file types
        ],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|tsx|css|html|json|webmanifest)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Map @ to the src folder
    },
  },
  build: {
    // Use assetsInlineLimit to control asset inlining
    assetsInlineLimit: 0, // Set to 0 to disable inlining (all assets will be copied to the dist folder)
  },
});
