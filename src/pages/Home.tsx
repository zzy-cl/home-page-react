import BentoCard, { BentoGrid } from '@/components/BentoCard'
import Kbd from '@/components/Kbd'
import { site } from '@/content/site'

/** 占位块:Task 6/8 接真数据后移除 */
function Placeholder({ lines = 2 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-[4px]"
          style={{ background: 'var(--glass-bg)', width: `${90 - i * 15}%` }}
        />
      ))}
    </div>
  )
}

function Home() {
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
        <Placeholder lines={3} />
      </BentoCard>

      {/* /now 摘要: col-span-2 */}
      <BentoCard title="NOW" className="lg:col-span-2">
        <Placeholder lines={2} />
      </BentoCard>

      {/* 精选项目: col-span-6 */}
      <BentoCard title="PROJECTS" className="lg:col-span-6">
        <Placeholder lines={3} />
      </BentoCard>

      {/* /uses 摘要: col-span-2 */}
      <BentoCard title="USES" className="lg:col-span-2">
        <Placeholder lines={2} />
      </BentoCard>

      {/* 一言: col-span-2 */}
      <BentoCard title="一言" className="lg:col-span-2">
        <Placeholder lines={2} />
      </BentoCard>

      {/* Cmd+K 提示: col-span-2 */}
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
