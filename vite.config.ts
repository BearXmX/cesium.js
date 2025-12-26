import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cesium(),
    // 必须放在 react 插件之后，且配置更严格的规则
    svgr({}),
  ],
  build: {},
  // @ts-ignore
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  server: {
    port: 8089,
    proxy: {
      '/api': {
        target: 'https://edu.21atcloud.com.cn/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  // 配置路径别名
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
