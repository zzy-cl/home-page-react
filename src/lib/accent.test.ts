import { describe, expect, it } from 'vitest'
import { ACCENTS, accentOrder, nextAccentKey, applyAccent, restoreAccent } from './accent'

describe('accent(设计稿 data-accent 方案)', () => {
  it('三色顺序为 blue → orange → violet', () => {
    expect(accentOrder()).toEqual(['blue', 'orange', 'violet'])
  })

  it('nextAccentKey 轮换并回绕', () => {
    expect(nextAccentKey('blue')).toBe('orange')
    expect(nextAccentKey('orange')).toBe('violet')
    expect(nextAccentKey('violet')).toBe('blue')
  })

  it('非法 key 回退 blue', () => {
    expect(nextAccentKey('nonsense')).toBe('blue')
  })

  it('ACCENTS 带 hex 与中文标签', () => {
    expect(ACCENTS.blue).toEqual({ hex: '#7aa2ff', label: '静谧蓝' })
    expect(ACCENTS.orange.label).toBe('暖橙')
    expect(ACCENTS.violet.label).toBe('紫罗兰')
  })

  it('无 DOM/localStorage 环境(如 vitest node)下调用不抛错', () => {
    expect(() => applyAccent('orange', false)).not.toThrow()
    expect(() => restoreAccent()).not.toThrow()
  })
})
