import { lazy, Suspense } from 'react'
import { createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router'
import { site } from '@/content/site'

// 页面级代码分割:三个路由各自 lazy(spec §6.4)
const HomePage = lazy(() => import('@/pages/Home'))
const UsesPage = lazy(() => import('@/pages/Uses'))
const NowPage = lazy(() => import('@/pages/Now'))

function RootLayout() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
      <footer className="fixed bottom-3 left-0 right-0 text-center">
        <span className="mono text-xs" style={{ color: 'var(--text-2)' }}>
          <Link to="/">{site.name}</Link> · {new Date().getFullYear()}
        </span>
      </footer>
    </div>
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
