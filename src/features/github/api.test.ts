import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchContributions, parseContributions } from './api'

const valid = {
  total: { '2026': 120 },
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

  it('level 超界夹取到 0-4', () => {
    const y = parseContributions({ ...valid, contributions: [{ date: 'd', count: 1, level: 7 }] })
    expect(y.days.at(-1)?.level).toBe(4)
  })

  it('total 为窗口内贡献之和,而非各年 total 求和', () => {
    const y = parseContributions(valid)
    expect(y.total).toBe(12)
  })

  it('非法 payload 抛错', () => {
    expect(() => parseContributions({})).toThrow('invalid contributions payload')
    expect(() => parseContributions({ total: {}, contributions: 'no' })).toThrow()
  })

  it('多年数据裁剪到最近一年(≤371 格,53 列)——jogruber 对老账户返回全部年份', () => {
    // 模拟真实事故:2191 天(2021-2026)
    const y = parseContributions({
      total: { '2021': 1, '2026': 106 },
      contributions: makeDays(2191),
    })
    expect(y.days.length).toBeLessThanOrEqual(371)
    // 窗口内每一天 count=1
    expect(y.total).toBe(y.days.filter((d) => d.date).length)
  })

  it('首格对齐周日(不足一周处以空格占位),保证 7 行网格每列恰为一周', () => {
    // 窗口首日 2025-10-20 是周一(weekday 1)→ 首格为空占位,次格为首日
    const y = parseContributions({ total: {}, contributions: makeDays(365) })
    expect(y.days[0].date).toBe('')
    expect(y.days[1].date).toBe('2025-10-20')
  })

  it('days 按日期升序(热力图列从左到右由旧到新)', () => {
    const y = parseContributions(valid)
    const dates = y.days.filter((d) => d.date).map((d) => d.date)
    expect(dates).toEqual(['2026-01-01', '2026-01-02'])
  })
})

describe('fetchContributions', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('网络失败返回 null 而不 throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    await expect(fetchContributions('x')).resolves.toBeNull()
  })

  it('HTTP 500 返回 null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    await expect(fetchContributions('x')).resolves.toBeNull()
  })

  it('成功路径解析数据', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => valid }))
    const y = await fetchContributions('x')
    expect(y?.total).toBe(12)
  })
})
