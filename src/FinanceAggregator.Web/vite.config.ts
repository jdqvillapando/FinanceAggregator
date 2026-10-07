import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  envDir: '../../',
  resolve: {
    // Ensure `@` path aliases resolve properly during CI/CD compilation
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Ensure target directory aligns with your SWA workflow output_location: "dist"
    outDir: 'dist',
    assetsDir: 'assets',
    // Generate clean manifest for static asset linking
    manifest: true,
    sourcemap: false,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000, // Force the port to 3000
    strictPort: true, // If 3000 is taken, fail instead of picking a random port
  }
});
