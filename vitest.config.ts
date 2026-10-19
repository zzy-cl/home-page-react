import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

// vitest 独立配置:与 vite.config.ts 分离,避免 vitest 内嵌 vite 与 rolldown-vite 的类型冲突
// 测试均为纯函数(md 解析/命令注册表),node 环境即可,无需 DOM 与 vite 插件
export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
})
