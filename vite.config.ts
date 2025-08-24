import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,  // Forcer le port 3000 pour éviter conflit PostgreSQL
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ⚡ OPTIMISATIONS PERFORMANCE
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            'lucide-react'
          ],
          'utils-vendor': [
            'clsx', 
            'tailwind-merge', 
            'class-variance-authority',
            'date-fns'
          ],
          'monitoring': ['@sentry/react', '@sentry/tracing'],
          'supabase': ['@supabase/supabase-js'],
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name.includes('vendor')) {
            return 'assets/vendor/[name]-[hash].js';
          }
          return 'assets/chunks/[name]-[hash].js';
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/styles/[name]-[hash][extname]';
          }
          if (assetInfo.name?.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    target: 'es2015',
    minify: 'esbuild',
    esbuild: mode === 'production' ? {
      drop: ['console', 'debugger'],
      legalComments: 'none'
    } : undefined
  }
}));