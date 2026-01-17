import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { compression } from "vite-plugin-compression2";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Fast Refresh for instant updates
      fastRefresh: true,
      // Ensure proper JSX handling
      jsxRuntime: 'automatic',
    }),
    // Brotli compression for production
    compression({
      algorithm: "brotliCompress",
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
      deleteOriginFile: false,
    }),
    // Gzip compression as fallback
    compression({
      algorithm: "gzip",
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Optimize production build for speed
    minify: "esbuild", // Fast and efficient minification
    sourcemap: false,
    cssCodeSplit: true,
    cssMinify: true,
    // Advanced code splitting for faster initial load
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - separate for better caching
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            // Split other vendors
            if (id.includes("axios") || id.includes("api")) {
              return "vendor-api";
            }
            return "vendor-other";
          }
          // Component chunks
          if (id.includes("/components/")) {
            if (id.includes("Admin")) {
              return "admin";
            }
            if (id.includes("Student")) {
              return "student";
            }
          }
        },
        // Optimize chunk file names for caching
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? "")) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.css$/.test(name ?? "")) {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    chunkSizeWarningLimit: 500, // Warn for chunks > 500kb
    target: "esnext",
    // Enable asset inlining for small files
    assetsInlineLimit: 4096,
    // Aggressive minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info"], // Remove specific functions
        passes: 2, // Multiple compression passes
      },
      mangle: {
        safari10: true,
      },
    },
  },
  // Optimize dependencies - preload critical packages
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"],
    exclude: [],
  },
  // Enable esbuild optimizations
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    legalComments: "none",
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
});
