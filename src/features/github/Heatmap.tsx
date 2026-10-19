import { Github } from 'lucide-react'
import { site } from '@/content/site'
import type { ContributionYear } from './api'

/** level → 格子背景透明度(level 0 用玻璃底) */
function levelColor(level: number): string {
  if (level <= 0) return 'var(--glass-bg)'
  return `rgba(122, 162, 255, ${level * 0.22 + 0.12})`
}

/**
 * GitHub 贡献热力图:53 列 × 7 行,固定 11px 格子在卡片内居中。
 * data 为 null / 空 → 灰色占位格(降级契约,Review Focus 1)。
 */
export default function Heatmap({ data }: { data: ContributionYear | null }) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-baseline justify-between">
        <span className="mono" style={{ color: 'var(--text-0)' }}>
          <span className="text-2xl font-bold">{(data?.total ?? 0).toLocaleString()}</span>{' '}
          <span className="text-xs" style={{ color: 'var(--text-1)' }}>
            次贡献 / 年
          </span>
        </span>
        <span className="mono text-[10px]" style={{ color: 'var(--text-2)' }}>
          github.com/{site.githubUser}
        </span>
      </div>

      {/* 53 列固定 11px 格子,横向居中;md 窄卡时允许滚动兜底(滚动条隐藏) */}
      <div
        className="flex justify-center overflow-x-auto py-2"
        style={{ scrollbarWidth: 'none' }}
      >
        <div
          className="grid grid-flow-col gap-[3px]"
          style={{ gridTemplateRows: 'repeat(7, 11px)', gridAutoColumns: '11px' }}
        >
          {(data?.days.length ? data.days : Array.from({ length: 53 * 7 })).map((d, i) => {
            const day = d as ContributionYear['days'][number] | undefined
            return (
              <div
                key={day?.date ?? i}
                className="rounded-[2px]"
                style={{ background: day ? levelColor(day.level) : 'var(--glass-bg)' }}
                title={day ? `${day.date} · ${day.count} 次` : undefined}
              />
            )
          })}
        </div>
      </div>

      <a
        href={`https://github.com/${site.githubUser}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mono flex items-center gap-1.5 text-xs"
        style={{ color: 'var(--text-1)' }}
      >
        <Github size={13} />
        在 GitHub 上查看完整活跃记录
      </a>
    </div>
  )
}
