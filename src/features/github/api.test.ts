import { describe, expect, it } from 'vitest'
import { parseContributions, toHeatmapLevels } from './api'

const valid = {
  total: { '2026': 12 },
  contributions: [
    { date: '2026-01-01', count: 3, level: 1 },
    { date: '2026-01-02', count: 9, level: 4 },
  ],
}

/** 构造 n 天连续日期(截至 2026-10-19,倒序如 jogruber 真实返回) */
function makeDays(n: number, countPerDay = 1) {
  const out: Array<{ date: string; count: number; level: number }> = []
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.UTC(2026, 9, 19))
    d.setUTCDate(d.getUTCDate() - i)
    out.push({ date: d.toISOString().slice(0, 10), count: countPerDay, level: 1 })
  }
  return out
}

describe('parseContributions', () => {
  it('解析合法 payload(2026-01-01 为周四,前有 4 个对齐占位)', () => {
    const y = parseContributions(valid)
    expect(y.days).toHaveLength(4 + 2)
    expect(y.days.at(-1)).toEqual({ date: '2026-01-02', count: 9, level: 4 })
  })

  it('total 为窗口内贡献之和,而非各年 total 求和', () => {
    expect(parseContributions(valid).total).toBe(12)
  })

  it('非法 payload 抛错', () => {
    expect(() => parseContributions({})).toThrow('invalid contributions payload')
    expect(() => parseContributions({ total: {}, contributions: 'no' })).toThrow()
  })

  it('多年数据裁剪到最近一年(≤371 格)——jogruber 对老账户返回全部年份', () => {
    const y = parseContributions({
      total: { '2021': 1, '2026': 106 },
      contributions: makeDays(2191),
    })
    expect(y.days.length).toBeLessThanOrEqual(371)
    expect(y.total).toBe(y.days.filter((d) => d.date).length)
  })

  it('首格对齐周日(空格占位),days 升序', () => {
    const y = parseContributions({ total: {}, contributions: makeDays(365) })
    expect(y.days[0].date).toBe('')
    expect(y.days[1].date).toBe('2025-10-20')
    const dates = y.days.filter((d) => d.date).map((d) => d.date)
    expect([...dates].sort()).toEqual(dates)
  })
})

describe('toHeatmapLevels(设计稿渲染数据:counts + levels 数组,future=-1)', () => {
  it('按 GitHub 官方阈值把 count 映射为 0-4', () => {
    const days = [
      { date: '', count: 0, level: 0 as const },
      { date: '2026-01-02', count: 0, level: 0 as const },
      { date: '2026-01-03', count: 2, level: 1 as const },
      { date: '2026-01-04', count: 4, level: 2 as const },
      { date: '2026-01-05', count: 7, level: 3 as const },
      { date: '2026-01-06', count: 12, level: 4 as const },
    ]
    expect(toHeatmapLevels(days, 4)).toEqual([0, 0, 1, 2, 3, -1])
  })

  it('占位格映射为 0', () => {
    const days = [
      { date: '', count: 0, level: 0 as const },
      { date: '2026-01-02', count: 5, level: 2 as const },
    ]
    expect(toHeatmapLevels(days, 2)).toEqual([0, 2])
  })
})
