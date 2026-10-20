/// <reference types="vite/client" />

// vite define 注入的构建时间戳(neofetch 使用)
declare const __BUILD_TIME__: string;

// 站点信息不来自环境变量:title/description 由 vite.config.ts 的 site-meta 插件
// 在构建期从 src/content/site.ts 注入(index.html 中保留占位符)。
