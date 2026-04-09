import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (
            id.includes('\\react\\') ||
            id.includes('/react/') ||
            id.includes('\\react-dom\\') ||
            id.includes('/react-dom/') ||
            id.includes('\\scheduler\\') ||
            id.includes('/scheduler/')
          ) {
            return 'react-vendor'
          }

          if (
            id.includes('\\@ant-design\\') ||
            id.includes('/@ant-design/')
          ) {
            return 'ant-icons'
          }

          if (id.includes('\\rc-') || id.includes('/rc-')) {
            return 'antd-rc'
          }

          return 'vendor'
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
})
