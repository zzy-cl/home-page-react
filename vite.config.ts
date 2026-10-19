import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'
import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vite.dev/config/
// 注意:vitest 配置独立在 vitest.config.ts(vitest 内嵌的 vite 与 rolldown-vite 类型不兼容,故不共用 defineConfig)
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    compression(),
  ],
  // 端口保持 Vite 默认 5173,不额外指定
  server: {
    open: true,
  },
  resolve: {
    alias: {
      // Vite 原生配置加载器不支持 CJS 的 __dirname,使用 ESM 等价物
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  define: {
    // Task 10 的 neofetch 消费:构建时间戳(ISO 字符串)
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        pure_funcs: ['console.log'],
        // 开发期保留报错输出,上线前 Task 11 再开
        drop_console: false,
        drop_debugger: true,
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 优化 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 优化资源文件命名
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.')
          let extType = info?.[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/.test(assetInfo.name ?? '')) {
            extType = 'images'
          } else if (/\.(woff2?|ttf|otf)(\?.*)?$/.test(assetInfo.name ?? '')) {
            extType = 'fonts'
          }
          return `assets/${extType}/[name]-[hash][extname]`
        },
        // 优化 chunk 文件命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks(id) {
          // React 核心库单独分包,其余交 rolldown 默认分包
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
        },
      },
    },
  },
})
