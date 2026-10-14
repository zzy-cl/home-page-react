import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { compression } from 'vite-plugin-compression2'
import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default ({ mode }: { mode: string }) =>
  defineConfig({
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              // js / css / 字体静态资源缓存
              urlPattern: /(.*?)\.(js|css|woff2|woff|ttf)/,
              handler: 'CacheFirst',
              options: { cacheName: 'js-css-cache' },
            },
            {
              // 图片缓存
              urlPattern: /(.*?)\.(png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/,
              handler: 'CacheFirst',
              options: { cacheName: 'image-cache' },
            },
          ],
        },
        manifest: {
          name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          short_name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          description: loadEnv(mode, process.cwd()).VITE_SITE_DES,
          display: 'standalone',
          start_url: '/',
          theme_color: '#424242',
          background_color: '#424242',
          icons: [48, 72, 96, 128, 144, 192, 512].map((size) => ({
            src: `/images/icon/${size}.png`,
            sizes: `${size}x${size}`,
            type: 'image/png',
          })),
        },
      }),
      compression(),
    ],
    // 端口保持 Vite 默认 5173，不额外指定
    server: {
      open: true,
    },
    resolve: {
      alias: {
        // Vite 原生配置加载器不支持 CJS 的 __dirname，使用 ESM 等价物
        '@': resolve(import.meta.dirname, 'src'),
      },
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          pure_funcs: ['console.log'],
          drop_console: true, // 生产环境移除所有 console
          drop_debugger: true, // 移除 debugger
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
            // React 核心库单独分包
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react'
            }
            // UI 组件库分包
            if (id.includes('node_modules/antd') || id.includes('node_modules/@icon-park')) {
              return 'vendor-ui'
            }
            // 音乐播放器分包
            if (id.includes('node_modules/aplayer')) {
              return 'vendor-player'
            }
            // 数据获取库分包
            if (id.includes('node_modules/@tanstack/react-query') || id.includes('node_modules/zustand')) {
              return 'vendor-query'
            }
            // 动画库分包
            if (id.includes('node_modules/motion')) {
              return 'vendor-motion'
            }
          },
        },
      },
    },
  })
