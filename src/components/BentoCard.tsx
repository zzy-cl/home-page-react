import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface BentoCardProps {
  /** 卡片左上角标题(可选) */
  title?: string
  /** 追加类名(布局 span 由调用方传入) */
  className?: string
  children: ReactNode
}

/**
 * Bento 卡片原语:玻璃材质 + 交错入场(spec §3.2)
 * 入场由父级 motion 容器的 staggerChildren 编排,单卡只声明 variants。
 * hover 仅 scale(1.01),transition 只作用于 transform —— 动画红线。
 */
export default function BentoCard({ title, className = '', children }: BentoCardProps) {
  return (
    <motion.section
      className={`glass-card p-5 transition-transform duration-200 hover:scale-[1.01] ${className}`}
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0 },
      }}
    >
      {title && (
        <div className="mono mb-3 text-xs tracking-widest" style={{ color: 'var(--text-2)' }}>
          {title}
        </div>
      )}
      {children}
    </motion.section>
  )
}

/** Bento 网格容器:统一编排交错入场(spec §4.1) */
export function BentoGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {children}
    </motion.div>
  )
}
