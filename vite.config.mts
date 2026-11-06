import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
  // Pixi's typedarray-pool dependency expects the browser Buffer implementation.
  resolve: {alias: {buffer: 'buffer/'}},
  plugins: [
    react(),
    VitePWA({
      // Let the next visit activate updates, without interrupting a game.
      registerType: 'prompt',
      injectRegister: 'script',
      includeAssets: ['favicon.ico', 'icons/*.png', 'images/perk_icons/*.png'],
      manifest: {
        name: 'Break Only Three',
        short_name: 'Break Only Three',
        description: 'Break only three',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [{src: 'icons/favicon-64x64.png', sizes: '64x64', type: 'image/png'}],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ],
});
