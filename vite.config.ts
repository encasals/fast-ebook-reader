import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'icons/*.svg'],
      devOptions: {
        enabled: true // Enable PWA in dev mode for testing
      },
      manifest: {
        name: 'Fast Ebook Reader',
        short_name: 'Fast Ebook Reader',
        description: 'Aplicación de lectura rápida RSVP para libros EPUB',
        theme_color: '#faf8f5',
        background_color: '#faf8f5',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui', 'tabbed'],
        orientation: 'portrait',
        scope: '/',
        start_url: '.',
        id: 'fast-ebook-reader',
        lang: 'es',
        dir: 'ltr',
        prefer_related_applications: false,
        categories: ['books', 'education', 'productivity'],
        iarc_rating_id: 'e84b072d-71b3-4d3e-86ae-31a8ce4e53e7',
        edge_side_panel: {
          preferred_width: 400
        },
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'icons/screenshot-narrow.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Lectura rápida RSVP'
          },
          {
            src: 'icons/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Vista de biblioteca'
          }
        ],
        shortcuts: [
          {
            name: 'Biblioteca',
            short_name: 'Biblioteca',
            description: 'Ver tu biblioteca de libros',
            url: '/',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }]
          }
        ],
        file_handlers: [
          {
            action: '/',
            accept: {
              'application/epub+zip': ['.epub']
            },
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
            launch_type: 'single-client'
          }
        ],
        launch_handler: {
          client_mode: ['focus-existing', 'auto']
        },
        protocol_handlers: [
          {
            protocol: 'web+fastreader',
            url: '/?source=%s'
          }
        ],
        share_target: {
          action: '/',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            files: [
              {
                name: 'epub',
                accept: ['application/epub+zip', '.epub']
              }
            ]
          }
        }
      },
      workbox: {
        // Cache all static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot}'],
        // Make sure the SW takes control immediately
        clientsClaim: true,
        skipWaiting: true,
        // Cache navigations for offline support
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        runtimeCaching: [
          {
            // Cache all same-origin requests
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    hmr: {
      host: 'localhost'
    }
  },
  preview: {
    port: 4000,
    host: true,
    https: true
  }
});
