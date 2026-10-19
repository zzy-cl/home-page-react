import { lazy, Suspense, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/app/router'
import { useCommandHotkey } from '@/features/command/CommandPalette'
import { shouldOpenTerminal } from '@/features/terminal/commands'
import { useUiStore } from '@/store/ui'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 外部数据失败一律静默降级(spec §6.3):不弹错,靠 staleTime 限流
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// 彩蛋层动态加载(spec §6.4):首次触发才拉取 chunk,不占首屏预算
const CommandPalette = lazy(() => import('@/features/command/CommandPalette'))
const Terminal = lazy(() => import('@/features/terminal/Terminal'))

/** 全局 `~` 键:打开终端(input 聚焦/面板已开时不触发) */
function useTerminalHotkey() {
  const setTerminalOpen = useUiStore((s) => s.setTerminalOpen)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { commandOpen, terminalOpen } = useUiStore.getState()
      if (shouldOpenTerminal(e, commandOpen || terminalOpen)) {
        e.preventDefault()
        setTerminalOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setTerminalOpen])
}

function Shell() {
  useCommandHotkey()
  useTerminalHotkey()
  return (
    <>
      <RouterProvider router={router} />
      <Suspense fallback={null}>
        <CommandPalette />
        <Terminal />
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Shell />
    </QueryClientProvider>
  )
}
