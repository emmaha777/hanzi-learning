import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  // 对于 Vercel 和大多数部署平台，使用绝对路径
  // 如果部署到子目录（如 GitHub Pages），可以改为 './'
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 确保所有资源都正确打包
    rollupOptions: {
      input: resolve(__dirname, 'src/index.html')
    },
    // 确保 HTML 文件在根目录
    emptyOutDir: true,
    // 确保资源文件正确复制
    copyPublicDir: true
  },
  // 开发服务器配置
  server: {
    port: 3000,
    open: '/src/index.html'
  },
  // 公共资源目录
  publicDir: 'public'
})
