import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchContributions, parseContributions } from './api'

const valid = {
  total: { '2026': 120 },
  contributions: [
    { date: '2026-01-01', count: 3, level: 1 },
    { date: '2026-01-02', count: 9, level: 4 },
  ],
}

describe('parseContributions', () => {
  it('解析合法 payload', () => {
    const y = parseContributions(valid)
    expect(y.total).toBe(120)
    expect(y.days).toHaveLength(2)
    expect(y.days[1]).toEqual({ date: '2026-01-02', count: 9, level: 4 })
  })

  it('level 超界夹取到 0-4', () => {
    const y = parseContributions({ ...valid, contributions: [{ date: 'd', count: 1, level: 7 }] })
    expect(y.days[0].level).toBe(4)
  })

  it('非法 payload 抛错', () => {
    expect(() => parseContributions({})).toThrow('invalid contributions payload')
    expect(() => parseContributions({ total: {}, contributions: 'no' })).toThrow()
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
    expect(y?.total).toBe(120)
  })
})
