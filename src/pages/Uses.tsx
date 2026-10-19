import BentoCard from '@/components/BentoCard'
import { useSections } from '@/content/uses'

function Uses() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-[8vh]">
      <header>
        <h1 className="text-3xl font-bold">Uses</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-1)' }}>
          装备与技术栈,以及每一样东西的使用语境
        </p>
      </header>

      {useSections.map((section) => (
        <BentoCard key={section.title} title={section.title}>
          <ul className="space-y-4">
            {section.items.map((item) => (
              <li key={item.name} className="flex flex-col gap-1">
                <span className="mono text-sm" style={{ color: 'var(--text-0)' }}>
                  {item.name}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-1)' }}>
                  {item.note}
                </span>
              </li>
            ))}
          </ul>
        </BentoCard>
      ))}
    </div>
  )
}

export default Uses
