import { lazy } from 'react';

/**
 * 页面级代码分割(spec §6.4)。
 * lazy 组件单独成文件导出:router.tsx 只保留路由表配置(非组件导出),
 * 满足 react-refresh/only-export-components 的"文件只导出组件"约束。
 */
export const HomePage = lazy(() => import('@/pages/Home'));
export const UsesPage = lazy(() => import('@/pages/Uses'));
export const NowPage = lazy(() => import('@/pages/Now'));
