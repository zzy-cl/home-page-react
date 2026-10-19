import { Github } from 'lucide-react'
import { site } from '@/content/site'
import { toHeatmapLevels } from './api'
import type { ContributionYear } from './api'

/**
 * GitHub 热力图(设计稿视觉):
 * 53 列 × 7 行固定 11px 格子、l1-l4 accent 色阶、future 近透明格、少→多图例。
 * data 为 null → 全灰占位(降级契约,Review Focus 1)。
 */
export default function Heatmap({ data }: { data: ContributionYear | null }) {
  const total = data?.total ?? 0

  // todayIndex:窗口最后一天的下标(其余为 future 近透明)
  const days = data?.days ?? Array.from({ length: 53 * 7 }, () => ({ date: '', count: 0, level: 0 as const }))
  const lastReal = days.reduce((acc, d, i) => (d.date ? i : acc), -1)
  const levels = toHeatmapLevels(days, lastReal)

  return (
    <>
      <header className="hm-head">
        <div className="hm-stat">
          <span className="card-kicker">GITHUB</span>
          <p className="hm-total">
            <strong className="hm-num mono">{total.toLocaleString()}</strong>
            <span className="hm-unit">次贡献 / 年</span>
          </p>
        </div>
        <a className="hm-id mono" href={site.github} target="_blank" rel="noopener noreferrer">
          github.com/{site.githubUser}
        </a>
      </header>

      <div className="hm-scroll">
        <div
          className="hm-grid"
          role="img"
          aria-label={`过去一年的 GitHub 贡献热力图,共 ${total} 次贡献`}
        >
          {days.map((d, i) => {
            const lv = levels[i]
            const cls =
              lv === -1 ? 'hm-cell future' : lv > 0 ? `hm-cell l${lv}` : 'hm-cell'
            return (
              <i
                key={d.date || `pad-${i}`}
                className={cls}
                title={d.date ? (d.count === 0 ? `${d.date} · 无贡献` : `${d.date} · ${d.count} 次贡献`) : undefined}
                aria-hidden="true"
              />
            )
          })}
        </div>
      </div>

      <footer className="hm-foot">
        <a className="link-accent mono" href={site.github} target="_blank" rel="noopener noreferrer">
          <Github size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
          在 GitHub 上查看完整活跃记录
        </a>
        <span className="hm-legend" aria-hidden="true">
          <span className="mono">少</span>
          <i className="hm-cell" />
          <i className="hm-cell l1" />
          <i className="hm-cell l2" />
          <i className="hm-cell l3" />
          <i className="hm-cell l4" />
          <span className="mono">多</span>
        </span>
      </footer>
    </>
  )
}
