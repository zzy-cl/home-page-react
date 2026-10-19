import { Link } from '@tanstack/react-router'
import { Star } from 'lucide-react'
import BentoCard, { BentoGrid } from '@/components/BentoCard'
import Kbd from '@/components/Kbd'
import { site } from '@/content/site'
import { projects } from '@/content/projects.data'
import { useSections } from '@/content/uses'
import Heatmap from '@/features/github/Heatmap'
import { useContributions, useRepoStars } from '@/features/github/hooks'
import HitokotoCard from '@/features/hitokoto/HitokotoCard'
import { loadNowEntries } from '@/lib/md'

function Home() {
  // 构建期已收集的 /now 条目(按日期倒序),首条作为摘要卡数据
  const nowEntries = loadNowEntries()
  const latest = nowEntries[0]
  // GitHub 数据(失败时为 null,卡片内降级)
  const { data: contributions } = useContributions()
  const { data: stars } = useRepoStars()
  const starsByRepo = new Map((stars ?? []).map((s) => [s.repo, s.stars]))

  const nowSummary = latest
    ? latest.body.length > 60
      ? `${latest.body.slice(0, 60)}…`
      : latest.body
    : null

  const usesPreview = useSections.flatMap((s) => s.items.slice(0, 1).map((i) => i.name)).slice(0, 3)

  return (
    <BentoGrid className="mx-auto grid max-w-6xl grid-cols-1 gap-[var(--gap-grid)] p-4 md:grid-cols-2 lg:grid-cols-12 lg:pt-[8vh]">
      {/* Hero: col-span-7 row-span-2 */}
      <BentoCard className="flex flex-col justify-center md:col-span-2 lg:col-span-7 lg:row-span-2">
        <h1 className="text-5xl font-bold lg:text-6xl">{site.name}</h1>
        <p className="mt-4 text-lg" style={{ color: 'var(--text-1)' }}>
          {site.tagline}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {site.keywords.map((k) => (
            <span
              key={k}
              className="mono rounded-full px-3 py-1 text-xs"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-1)',
              }}
            >
              {k}
            </span>
          ))}
        </div>
      </BentoCard>

      {/* GitHub 热力图: col-span-3 */}
      <BentoCard title="GITHUB" className="lg:col-span-3">
        <Heatmap data={contributions ?? null} />
      </BentoCard>

      {/* /now 摘要: col-span-2 */}
      <BentoCard title="NOW" className="lg:col-span-2">
        {nowSummary ? (
          <>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>
              {nowSummary}
            </p>
            <Link to="/now" className="mono mt-3 inline-block text-xs" style={{ color: 'var(--accent)' }}>
              查看全部 →
            </Link>
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            暂无近况
          </p>
        )}
      </BentoCard>

      {/* 精选项目: col-span-6 */}
      <BentoCard title="PROJECTS" className="lg:col-span-6">
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.repo}>
              <a
                href={`https://github.com/${p.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-baseline justify-between gap-3"
              >
                <span className="min-w-0">
                  <span className="mono text-sm" style={{ color: 'var(--text-0)' }}>
                    {p.name}
                  </span>
                  <span className="ml-3 hidden text-xs sm:inline" style={{ color: 'var(--text-1)' }}>
                    {p.desc}
                  </span>
                </span>
                <span className="mono flex shrink-0 items-center gap-1 text-xs" style={{ color: 'var(--text-1)' }}>
                  <Star size={12} style={{ color: 'var(--accent)' }} />
                  {starsByRepo.get(p.repo) ?? '--'}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </BentoCard>

      {/* /uses 摘要: col-span-2 */}
      <BentoCard title="USES" className="lg:col-span-2">
        {usesPreview.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {usesPreview.map((name) => (
                <span key={name} className="mono text-xs" style={{ color: 'var(--text-1)' }}>
                  {name}
                </span>
              ))}
            </div>
            <Link to="/uses" className="mono mt-3 inline-block text-xs" style={{ color: 'var(--accent)' }}>
              查看全部 →
            </Link>
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            暂无内容
          </p>
        )}
      </BentoCard>

      {/* 一言: col-span-2 */}
      <BentoCard title="一言" className="lg:col-span-2">
        <HitokotoCard />
      </BentoCard>

      {/* Cmd+K 提示: col-span-2(Task 9 接 openCommand) */}
      <BentoCard className="flex items-center justify-center lg:col-span-2">
        <div className="flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
          <span className="mono text-xs">全站指令</span>
        </div>
      </BentoCard>
    </BentoGrid>
  )
}

export default Home
