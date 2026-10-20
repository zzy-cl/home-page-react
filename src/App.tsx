import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { router } from '@/app/router';
import { useGlobalHotkeys } from '@/app/hotkeys';
import { useTerminalHotkey } from '@/features/terminal';
import { useUiStore } from '@/store/ui';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 外部数据失败一律静默降级(spec §6.3):不弹错,靠 staleTime 限流
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 彩蛋层动态加载(spec §6.4):按需条件挂载——首次触发才拉取 chunk。
// 本文件不得静态 import 彩蛋组件(热键逻辑在 app/hotkeys.ts 与各 feature 的 public 出口)。
const CommandPalette = lazy(() => import('@/features/command/CommandPalette'));
const Terminal = lazy(() => import('@/features/terminal/Terminal'));

function Shell() {
  useGlobalHotkeys();
  // 终端热键由 feature 自己提供,外壳只负责组合
  useTerminalHotkey();
  const commandOpen = useUiStore((s) => s.commandOpen);
  const terminalOpen = useUiStore((s) => s.terminalOpen);

  return (
    <>
      <RouterProvider router={router} />
      {commandOpen && (
        <Suspense fallback={null}>
          {/* 面板在 RouterProvider 之外,导航能力由组合根注入 */}
          <CommandPalette navigate={(to) => void router.navigate({ to })} />
        </Suspense>
      )}
      {terminalOpen && (
        <Suspense fallback={null}>
          <Terminal />
        </Suspense>
      )}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Shell />
    </QueryClientProvider>
  );
}
