import type { ReactNode } from 'react'

interface BentoCardProps {
  /** 卡片左上角标题(可选) */
  title?: string
  /** 追加类名(布局 span 由调用方传入) */
  className?: string
  children: ReactNode
}

/**
 * Bento 卡片原语:玻璃材质 + 交错入场(spec §3.2)。
 * 入场动画为纯 CSS(.bento-grid 内 nth-child 交错 delay),
 * hover 仅 scale(1.01) —— 动画红线:只动 transform/opacity。
 */
export default function BentoCard({ title, className = '', children }: BentoCardProps) {
  return (
    <section className={`glass-card bento-item p-5 transition-transform duration-200 hover:scale-[1.01] ${className}`}>
      {title && (
        <div className="mono mb-3 text-xs tracking-widest" style={{ color: 'var(--text-2)' }}>
          {title}
        </div>
      )}
      {children}
    </section>
  )
}

/** Bento 网格容器:子项交错入场由 CSS nth-child 编排(见 index.css) */
export function BentoGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bento-grid ${className}`}>{children}</div>
}
