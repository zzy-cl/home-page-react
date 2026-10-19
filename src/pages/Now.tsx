import BentoCard from '@/components/BentoCard'
import { loadNowEntries } from '@/lib/md'

function Now() {
  // 构建期收集,按日期倒序
  const entries = loadNowEntries()

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-[8vh]">
      <header>
        <h1 className="text-3xl font-bold">Now</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-1)' }}>
          最近在折腾什么
        </p>
      </header>

      {entries.length === 0 ? (
        <BentoCard>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            暂无近况
          </p>
        </BentoCard>
      ) : (
        entries.map((entry) => (
          <BentoCard key={`${entry.date}-${entry.title}`}>
            <div className="mono text-xs" style={{ color: 'var(--accent)' }}>
              {entry.date}
            </div>
            {entry.title && (
              <h2 className="mt-2 text-xl font-semibold" style={{ color: 'var(--text-0)' }}>
                {entry.title}
              </h2>
            )}
            {/* 正文按空行分段 */}
            <div className="mt-3 space-y-3">
              {entry.body
                .split(/\n{2,}/)
                .filter((p) => p.trim())
                .map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>
                    {para}
                  </p>
                ))}
            </div>
          </BentoCard>
        ))
      )}
    </div>
  )
}

export default Now
