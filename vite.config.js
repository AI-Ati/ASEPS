import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Australian State Economic Pathways Simulator',
        short_name: 'ASEPS',
        description: 'Evidence-based economic growth simulator for Australian states — ABS/RBA data, Solow-Lucas models, policy pathways',
        theme_color: '#1a3557',
        background_color: '#f8f7f4',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        // Cache ABS API calls for 24 hours
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.data\.abs\.gov\.au\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'abs-api-cache',
              expiration: { maxAgeSeconds: 60 * 60 * 24 }
            }
          }
        ]
      }
    })
  ],
  // GitHub Pages deploys to /aseps/ subdirectory
  base: process.env.DEPLOY_TARGET === 'github' ? '/aseps/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'charts': ['recharts'],
          'katex': ['katex'],
          // html2pdf is dynamically imported in ExportButton — no static chunk needed
        }
      }
    }
  },
  optimizeDeps: {
    include: ['katex', 'recharts', 'html2pdf.js']
  }
})
