import { useEffect } from 'react'
import { shouldOpenTerminal } from '@/features/terminal/commands'
import { useUiStore } from '@/store/ui'

/**
 * 全局快捷键(独立模块:App 静态导入热键逻辑,
 * 而彩蛋 UI 组件保持纯动态导入,确保 chunk 分割生效)。
 * 键位与设计稿 app.js 一致:Ctrl/Cmd+K 面板 · ~ 或 ` 终端 · Esc 关闭浮层
 */
export function useGlobalHotkeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { commandOpen, terminalOpen, setCommandOpen, setTerminalOpen } = useUiStore.getState()
      const overlayOpen = commandOpen || terminalOpen

      // Ctrl/Cmd+K:开关面板
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen(!commandOpen)
        return
      }

      // Esc 关闭任意浮层
      if (overlayOpen && e.key === 'Escape') {
        e.preventDefault()
        setCommandOpen(false)
        setTerminalOpen(false)
        return
      }

      // ~ 或 `:打开终端(input 聚焦或浮层已开时不触发)
      const typing = !!(
        e.target &&
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
      )
      if (shouldOpenTerminal(e, overlayOpen || typing)) {
        e.preventDefault()
        setTerminalOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
