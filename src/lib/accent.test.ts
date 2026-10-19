import { describe, expect, it } from 'vitest'
import { applyAccent, restoreAccent } from './accent'

describe('applyAccent', () => {
  it('无 DOM/localStorage 环境(如 vitest node)下调用不抛错', () => {
    // 模块在浏览器外的健壮性:纯防御胶水也不允许抛
    expect(() => applyAccent('#ff9e64')).not.toThrow()
    expect(() => restoreAccent()).not.toThrow()
  })
})
