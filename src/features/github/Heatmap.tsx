import { Github } from 'lucide-react'
import { site } from '@/content/site'
import type { ContributionYear } from './api'

/** level → 格子背景透明度(level 0 用玻璃底) */
function levelColor(level: number): string {
  if (level <= 0) return 'var(--glass-bg)'
  return `rgba(122, 162, 255, ${level * 0.22 + 0.12})`
}

/**
 * GitHub 贡献热力图:53 列 × 7 行 CSS grid。
 * data 为 null / 空 → 灰色占位格(降级契约,Review Focus 1)。
 */
export default function Heatmap({ data }: { data: ContributionYear | null }) {
  if (!data || data.days.length === 0) {
    return (
      <div className="grid grid-flow-col gap-[3px]" style={{ gridTemplateRows: 'repeat(7, 10px)' }}>
        {Array.from({ length: 53 * 7 }).map((_, i) => (
          <div key={i} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: 'var(--glass-bg)' }} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="mono text-lg" style={{ color: 'var(--text-0)' }}>
          {data.total.toLocaleString()}{' '}
          <span className="text-xs" style={{ color: 'var(--text-1)' }}>
            次贡献 / 年
          </span>
        </span>
        <a
          href={`https://github.com/${site.githubUser}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub 主页"
        >
          <Github size={16} style={{ color: 'var(--text-1)' }} />
        </a>
      </div>
      {/* 小屏允许横向滚动(滚动而非动画,不违反红线) */}
      <div className="overflow-x-auto pb-1">
        <div className="grid grid-flow-col gap-[3px]" style={{ gridTemplateRows: 'repeat(7, 10px)' }}>
          {data.days.map((d) => (
            <div
              key={d.date}
              className="h-[10px] w-[10px] rounded-[2px]"
              style={{ background: levelColor(d.level) }}
              title={`${d.date} · ${d.count} 次`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
