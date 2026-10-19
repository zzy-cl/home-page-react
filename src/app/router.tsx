import { lazy, Suspense } from 'react'
import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { site } from '@/content/site'

// 页面级代码分割(spec §6.4)
const HomePage = lazy(() => import('@/pages/Home'))
const UsesPage = lazy(() => import('@/pages/Uses'))
const NowPage = lazy(() => import('@/pages/Now'))

function RootLayout() {
  return (
    <>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
      {/* 固定页脚(设计稿 .site-footer):ICP 备案为合规必须,icp 为空时自动隐藏 */}
      <footer className="site-footer">
        {site.name} · {new Date().getFullYear()}
        {site.icp && (
          <>
            {' · '}
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
              {site.icp}
            </a>
          </>
        )}
      </footer>
    </>
  )
}

const rootRoute = createRootRoute({ component: RootLayout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const usesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/uses',
  component: UsesPage,
})

const nowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/now',
  component: NowPage,
})

export const routeTree = rootRoute.addChildren([indexRoute, usesRoute, nowRoute])

export const router = createRouter({ routeTree })

// 类型安全:路由表类型注册
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
