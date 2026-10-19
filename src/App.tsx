import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/app/router'
import { useCommandHotkey } from '@/features/command/CommandPalette'

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

function Shell() {
  useCommandHotkey()
  return (
    <>
      <RouterProvider router={router} />
      <Suspense fallback={null}>
        <CommandPalette />
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
