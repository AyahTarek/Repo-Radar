import { fileURLToPath } from 'node:url';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const DEV_PORT = 9000;
const PREVIEW_PORT = 9100;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    // Workspace packages are consumed as TypeScript source, so React and Emotion
    // must resolve to a single instance across app and packages.
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },
  server: { port: DEV_PORT },
  preview: { port: PREVIEW_PORT },
  build: {
    outDir: path.resolve(__dirname, '../../dist'),
    rolldownOptions: {
      output: {
        // MUI and React change far less often than app code, so keeping them in
        // their own chunks lets a redeploy reuse the cached vendor bundles.
        codeSplitting: {
          groups: [
            // `@mui/x-*` (the chart packages) is deliberately excluded: grouping it
            // with @mui/material would put it in a chunk the initial page load
            // needs, undoing the lazy TrackedPage route. Left ungrouped, it lands
            // in the async chunk where it belongs.
            { name: 'mui', test: /node_modules[\\/]@mui[\\/](?!x-)/ },
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
