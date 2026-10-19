/// <reference types="vite/client" />

// vite define 注入的构建时间戳(neofetch 使用)
declare const __BUILD_TIME__: string

interface ImportMetaEnv {
  /** 站点名称 */
  readonly VITE_SITE_NAME: string
  /** 站点地址 */
  readonly VITE_SITE_URL: string
  /** GitHub 用户名(热力图/star 数据) */
  readonly VITE_GITHUB_USER: string
  /** GitHub 仓库主页 */
  readonly VITE_SITE_GITHUB: string
  /** 联系邮箱 */
  readonly VITE_SITE_EMAIL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
