import type { CSSProperties, ReactNode } from 'react'

interface BentoCardProps {
  /** 卡片样式变体(设计稿 .card--hero 等) */
  variant: 'hero' | 'heatmap' | 'projects' | 'now' | 'uses' | 'quote'
  /** mono 大写小标题(GITHUB / NOW / PROJECTS…) */
  kicker?: string
  /** 无障碍名称 */
  label: string
  /** 入场交错序号(设计稿 --i) */
  index: number
  className?: string
  children: ReactNode
}

const VARIANT_CLASS: Record<BentoCardProps['variant'], string> = {
  hero: 'card--hero',
  heatmap: 'card--heatmap',
  projects: 'card--projects',
  now: 'card--now',
  uses: 'card--uses',
  quote: 'card--quote',
}

/**
 * Bento 卡片原语:玻璃渐变 + 内高光 + hover accent 描边 + 交错入场。
 * 视觉规格来自 OpenDesign 设计稿(.card / .card-kicker)。
 */
export default function BentoCard({
  variant,
  kicker,
  label,
  index,
  className = '',
  children,
}: BentoCardProps) {
  return (
    <section
      className={`card ${VARIANT_CLASS[variant]} ${className}`}
      style={{ '--i': index } as CSSProperties}
      aria-label={label}
    >
      {kicker && <h2 className="card-kicker">{kicker}</h2>}
      {children}
    </section>
  )
}
