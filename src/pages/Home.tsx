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

/*
 * 首屏布局(spec §4.1 的 12 列实现):
 *   行1-2: Hero 4(row2) | GitHub 热力图 8(row2)
 *   行3:   精选项目 4 | NOW 摘要 3 | USES 摘要 3 | 一言 2
 *   Cmd+K 提示并入 Hero 底缘(提示性元素不值得独占卡片)
 * lg 固定行高 170px 生成仪表盘感;外层 min-h-svh 垂直居中。
 */
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
    <div className="flex min-h-svh items-center">
      <BentoGrid className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-[var(--gap-grid)] p-4 md:grid-cols-2 lg:auto-rows-[170px] lg:grid-cols-12">
        {/* Hero: col-span-4 row-span-2,底部 Cmd+K 提示 */}
        <BentoCard className="flex flex-col justify-between md:col-span-2 lg:col-span-4 lg:row-span-2">
          <div>
            <h1 className="text-4xl font-bold lg:text-5xl">{site.name}</h1>
            <p className="mt-3 text-base" style={{ color: 'var(--text-1)' }}>
              {site.tagline}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {site.keywords.map((k) => (
                <span
                  key={k}
                  className="mono rounded-full px-2.5 py-1 text-[11px]"
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
          </div>
          <div className="mt-6 flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
            <span className="mono text-[11px]">全站指令</span>
          </div>
        </BentoCard>

        {/* GitHub 热力图: col-span-8 row-span-2 */}
        <BentoCard title="GITHUB" className="lg:col-span-8 lg:row-span-2 md:col-span-2">
          <Heatmap data={contributions ?? null} />
        </BentoCard>

        {/* 精选项目: col-span-4 */}
        <BentoCard title="PROJECTS" className="md:col-span-2 lg:col-span-4">
          <ul className="space-y-2.5">
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
                    <span className="ml-2 hidden text-xs xl:inline" style={{ color: 'var(--text-1)' }}>
                      {p.desc}
                    </span>
                  </span>
                  <span
                    className="mono flex shrink-0 items-center gap-1 text-xs"
                    style={{ color: 'var(--text-1)' }}
                  >
                    <Star size={12} style={{ color: 'var(--accent)' }} />
                    {starsByRepo.get(p.repo) ?? '--'}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </BentoCard>

        {/* /now 摘要: col-span-3 */}
        <BentoCard title="NOW" className="lg:col-span-3">
          {nowSummary ? (
            <>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-1)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {nowSummary}
              </p>
              <Link to="/now" className="mono mt-2 inline-block text-xs" style={{ color: 'var(--accent)' }}>
                查看全部 →
              </Link>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              暂无近况
            </p>
          )}
        </BentoCard>

        {/* /uses 摘要: col-span-3 */}
        <BentoCard title="USES" className="lg:col-span-3">
          {usesPreview.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {usesPreview.map((name) => (
                  <span key={name} className="mono text-xs" style={{ color: 'var(--text-1)' }}>
                    {name}
                  </span>
                ))}
              </div>
              <Link to="/uses" className="mono mt-2 inline-block text-xs" style={{ color: 'var(--accent)' }}>
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
        <BentoCard title="一言" className="md:col-span-2 lg:col-span-2">
          <HitokotoCard />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

export default Home
