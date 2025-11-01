import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
 server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8083', // Spring Boot
        changeOrigin: true,
        secure: false,
        // if Spring expects the same path, no rewrite needed
        // rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
