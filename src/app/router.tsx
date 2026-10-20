import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import RootLayout from './RootLayout';
import { HomePage, UsesPage, NowPage } from './lazyPages';

// 本文件是纯路由表配置:只导出非组件值(routeTree/router),
// 组件定义在 RootLayout.tsx 与 lazyPages.ts(react-refresh/only-export-components)。

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const usesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/uses',
  component: UsesPage,
});

const nowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/now',
  component: NowPage,
});

export const routeTree = rootRoute.addChildren([indexRoute, usesRoute, nowRoute]);

export const router = createRouter({ routeTree });

// 类型安全:路由表类型注册
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
