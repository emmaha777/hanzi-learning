import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 使用相对路径，便于部署到子目录
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 确保所有资源都正确打包
    rollupOptions: {
      input: resolve(__dirname, 'src/index.html')
    },
    // 确保 HTML 文件在根目录
    emptyOutDir: true
  },
  // 开发服务器配置
  server: {
    port: 3000,
    open: '/src/index.html'
  },
  // 公共资源目录
  publicDir: 'public'
})
