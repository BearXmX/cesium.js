import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cesium()],
  build: {},
  // @ts-ignore
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  server: {
    proxy: {
      '/api': {
        target: 'https://edu.21atcloud.com.cn/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
