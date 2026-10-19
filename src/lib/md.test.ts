import { describe, expect, it } from 'vitest'
import { parseFrontmatter, parseNowEntry, sortNowEntries } from './md'

describe('parseFrontmatter', () => {
  it('解析标准 frontmatter', () => {
    const { meta, body } = parseFrontmatter('---\ntitle: 你好\ndate: 2026-10-19\n---\n正文')
    expect(meta).toEqual({ title: '你好', date: '2026-10-19' })
    expect(body).toBe('正文')
  })

  it('无 frontmatter 时 meta 为空、body 为全文', () => {
    const { meta, body } = parseFrontmatter('只有正文')
    expect(meta).toEqual({})
    expect(body).toBe('只有正文')
  })

  it('frontmatter 未闭合时按无 frontmatter 处理', () => {
    const { meta } = parseFrontmatter('---\ntitle: 未闭合')
    expect(meta).toEqual({})
  })

  it('值中的冒号不破坏解析', () => {
    const { meta } = parseFrontmatter('---\ntitle: a: b\n---\nx')
    expect(meta.title).toBe('a: b')
  })
})

describe('parseNowEntry 容错', () => {
  it('缺 title 兜底空串,不抛错', () => {
    const e = parseNowEntry('---\ndate: 2026-10-19\n---\n正文')
    expect(e.title).toBe('')
    expect(e.body).toBe('正文')
  })

  it('缺 date 兜底空串', () => {
    expect(parseNowEntry('---\ntitle: t\n---\nb').date).toBe('')
  })
})

describe('sortNowEntries', () => {
  it('按 date 倒序', () => {
    const sorted = sortNowEntries([
      { date: '2026-01-01', title: 'a', body: '' },
      { date: '2026-10-01', title: 'b', body: '' },
    ])
    expect(sorted[0].title).toBe('b')
  })
})
