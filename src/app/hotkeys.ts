import { useEffect } from 'react'
import { shouldOpenTerminal } from '@/features/terminal/commands'
import { useUiStore } from '@/store/ui'

/**
 * 全局快捷键(独立模块:App 静态导入热键逻辑,
 * 而彩蛋 UI 组件保持纯动态导入,确保 chunk 分割生效)
 */
export function useGlobalHotkeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { commandOpen, terminalOpen, setCommandOpen, setTerminalOpen } = useUiStore.getState()

      // Ctrl/Cmd+K:开关面板;终端已开时不抢占
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (!terminalOpen) setCommandOpen(!commandOpen)
        return
      }

      // `:打开终端(input/textarea 聚焦或面板已开时不触发)
      if (shouldOpenTerminal(e, commandOpen || terminalOpen)) {
        e.preventDefault()
        setTerminalOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
