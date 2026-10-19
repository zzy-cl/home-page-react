import { describe, expect, it } from 'vitest'
import { filterCommands, type Command } from './registry'

const cmds: Command[] = [
  { id: '1', title: '首页', keywords: ['home', 'index'], section: '导航', action: () => {} },
  { id: '2', title: '装备清单', keywords: ['uses', 'gear'], section: '导航', action: () => {} },
  { id: '3', title: 'GitHub', keywords: ['仓库'], section: '链接', action: () => {} },
]

describe('filterCommands', () => {
  it('空 query 返回全部', () => expect(filterCommands(cmds, '')).toHaveLength(3))

  it('纯空格等价空 query', () => expect(filterCommands(cmds, '  ')).toHaveLength(3))

  it('title 命中', () => expect(filterCommands(cmds, '首页')[0].id).toBe('1'))

  it('keyword 命中且大小写不敏感', () => {
    expect(filterCommands(cmds, 'USES').map((c) => c.id)).toEqual(['2'])
  })

  it('无命中返回空数组', () => expect(filterCommands(cmds, 'zzz')).toEqual([]))
})
