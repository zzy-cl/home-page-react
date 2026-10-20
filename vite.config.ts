import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { compression } from 'vite-plugin-compression2';
import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import { site } from './src/content/site.ts';

/**
 * 站点身份注入:title / description 的唯一真相源是 src/content/site.ts,
 * index.html 只保留 __SITE_TITLE__ / __SITE_DESCRIPTION__ 占位符。
 * 改名/换 tagline 时不需要再同步 HTML。
 */
function siteMeta(): Plugin {
  const title = `${site.name} · ${site.tagline}`;
  const description = `${site.name}——${site.tagline}。${site.keywords.join(' · ')}。`;
  return {
    name: 'site-meta',
    transformIndexHtml(html) {
      return html
        .replaceAll('__SITE_TITLE__', title)
        .replaceAll('__SITE_DESCRIPTION__', description);
    },
  };
}

// https://vite.dev/config/
// 注意:vitest 配置独立在 vitest.config.ts(vitest 内嵌的 vite 与 rolldown-vite 类型不兼容,故不共用 defineConfig)
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    compression(),
    siteMeta(),
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
        // 生产环境移除全部 console(Task 11 收口)
        drop_console: true,
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
          const info = assetInfo.name?.split('.');
          let extType = info?.[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/.test(assetInfo.name ?? '')) {
            extType = 'images';
          } else if (/\.(woff2?|ttf|otf)(\?.*)?$/.test(assetInfo.name ?? '')) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        // 优化 chunk 文件命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks(id) {
          // React 核心库单独分包,其余交 rolldown 默认分包
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
        },
      },
    },
  },
});
