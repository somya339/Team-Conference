import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tsconfigPaths()],
  
  // Base URL for production
  base: mode === 'production' ? '/' : '/',
  
  // Development server configuration
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: mode === 'production' ? false : 'inline',
    minify: mode === 'production' ? 'terser' : false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-slot', 'class-variance-authority'],
          utils: ['rxjs', 'dayjs'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  // Preview configuration
  preview: {
    port: 4173,
    host: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'rxjs',
      'dayjs',
      '@radix-ui/react-slot',
      'class-variance-authority',
      'motion/react',
    ],
    esbuildOptions: {
      target: 'es2020'
    }
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    'process.env': {}
  },

  // CSS configuration
  css: {
    devSourcemap: true,
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': '/src',
    },
  },
}));
