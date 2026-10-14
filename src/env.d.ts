/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 站点名称 */
  readonly VITE_SITE_NAME: string
  /** 作者 */
  readonly VITE_SITE_AUTHOR: string
  /** 关键词 */
  readonly VITE_SITE_KEYWORDS: string
  /** 站点简介 */
  readonly VITE_SITE_DES: string
  /** 站点地址 */
  readonly VITE_SITE_URL: string
  /** 站点主图标 */
  readonly VITE_SITE_LOGO: string
  /** 主页图标 */
  readonly VITE_SITE_MAIN_LOGO: string
  /** Apple 端图标 */
  readonly VITE_SITE_APPLE_LOGO: string
  /** ICP 备案号 */
  readonly VITE_SITE_ICP: string
  /** 建站日期（可选） */
  readonly VITE_SITE_START?: string
  /** 简介文本 */
  readonly VITE_DESC_HELLO: string
  readonly VITE_DESC_TEXT: string
  readonly VITE_DESC_HELLO_OTHER: string
  readonly VITE_DESC_TEXT_OTHER: string
  /** 音乐播放器配置 */
  readonly VITE_MUSIC_ID: string
  readonly VITE_SONG_API: string
  readonly VITE_SONG_SERVER: string
  readonly VITE_SONG_TYPE: string
  readonly VITE_SONG_ID: string
  /** 高德天气 Key */
  readonly VITE_WEATHER_KEY: string
}
