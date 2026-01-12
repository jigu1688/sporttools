import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        // 完全保留路径，包括/api前缀
        rewrite: (path) => path,
      },
    },
  },
  // 构建优化配置
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 将第三方库单独打包
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'vendor';
          } else if (id.includes('antd')) {
            return 'antd';
          } else if (id.includes('@ant-design/charts')) {
            return 'charts';
          } else if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
            return 'redux';
          }
        },
      },
    },
    // 启用Tree Shaking
    minify: 'terser',
    // 生成sourcemap（生产环境可根据需要关闭）
    sourcemap: false,
    // 输出目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // 静态资源哈希长度
    assetsHashLength: 8,
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 启用rollup的依赖预构建
    ssrEmitAssets: true,
    // 调整chunk大小警告阈值
    chunkSizeWarningLimit: 2000,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', '@ant-design/icons'],
    exclude: ['some-large-lib-you-dont-need'],
  },
  // 配置静态资源CDN（可选，根据需要配置）
  // base: 'https://cdn.your-domain.com/',
})
