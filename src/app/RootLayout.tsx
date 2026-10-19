import { Suspense } from 'react';
import { Outlet } from '@tanstack/react-router';
import { site } from '@/content/site';

/**
 * 根布局(设计稿 .site-footer):ICP 备案为合规必须,icp 为空时自动隐藏。
 * 独立成文件:router.tsx 需导出 routeTree/router 等非组件值,
 * react-refresh/only-export-components 要求组件定义单独存放(fast refresh 约束)。
 */
export default function RootLayout() {
  return (
    <>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
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
  );
}
