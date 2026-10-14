import type { MessageInstance } from 'antd/es/message/interface'

/**
 * 全局通知实例。
 * antd 的 useApp 必须在组件树内使用，通过此模块把实例交给
 * 组件树之外的工具函数（如 utils/date 的问候语、默哀模式）使用。
 */
let instance: MessageInstance | null = null

export const setNoticeInstance = (m: MessageInstance) => {
  instance = m
}

export const notice = (): MessageInstance | null => instance
