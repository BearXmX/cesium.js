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
      '/ali-geo': {
        target: 'https://jingan-deploy-test.oss-cn-shanghai.aliyuncs.com/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ali-geo/, ''),
      },
      '/ai-geojson-server': {
        target: 'https://airesearch.ai-study.net/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ai-geojson-server/, ''),
      },
      '/dev-geo': {
        target: 'http://localhost:8090/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/dev-geo/, ''),
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
