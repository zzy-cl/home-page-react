import { describe, expect, it } from 'vitest'
import { executeCommand, shouldOpenTerminal, type TerminalContext } from './commands'

const ctx: TerminalContext = {
  user: 'zzy',
  now: { date: '2026-10-19', title: '重构启动' },
  usesNames: ['VS Code'],
  projects: [{ name: '呓语工位', repo: 'zzy-cl/home-page-react' }],
  buildTime: '2026-10-19T00:00:00.000Z',
  siteStart: '2026-10-19',
  keywords: ['React', 'Rust'],
  siteName: '呓语工位',
}

/** 伪键盘事件(node 环境,无 DOM) */
const kev = (target: { tagName?: string } | null) => ({ key: '~', target })

describe('executeCommand', () => {
  it('help 列出全部命令', () => {
    const lines = executeCommand('help', ctx)
    expect(lines.some((l) => l.text.includes('whoami'))).toBe(true)
  })

  it('whoami 含用户名', () => {
    expect(executeCommand('whoami', ctx).some((l) => l.text.includes('zzy'))).toBe(true)
  })

  it('sudo rm -rf / 返回彩蛋文案', () => {
    const lines = executeCommand('sudo rm -rf /', ctx)
    expect(lines[0].text).toContain('权限拒绝')
  })

  it('未知命令报 command not found', () => {
    const [l] = executeCommand('foo', ctx)
    expect(l.kind).toBe('error')
    expect(l.text).toContain('command not found: foo')
  })

  it('空输入返回空数组', () => expect(executeCommand('   ', ctx)).toEqual([]))

  it('命令大小写不敏感', () => {
    expect(executeCommand('HELP', ctx).length).toBeGreaterThan(0)
  })

  it('projects 列出仓库名', () => {
    const lines = executeCommand('projects', ctx)
    expect(lines.some((l) => l.text.includes('zzy-cl/home-page-react'))).toBe(true)
  })

  it('now 输出最近条目标题', () => {
    const lines = executeCommand('now', ctx)
    expect(lines.some((l) => l.text.includes('重构启动'))).toBe(true)
  })

  it('now 无数据时输出占位', () => {
    const lines = executeCommand('now', { ...ctx, now: null })
    expect(lines.some((l) => l.text.includes('暂无'))).toBe(true)
  })

  it('neofetch 含站点名与运行天数', () => {
    const lines = executeCommand('neofetch', ctx)
    const text = lines.map((l) => l.text).join('\n')
    expect(text).toContain('呓语工位')
    expect(text).toContain('天')
  })
})

describe('shouldOpenTerminal', () => {
  it('普通目标且未阻塞时打开', () => {
    expect(shouldOpenTerminal(kev({ tagName: 'DIV' }), false)).toBe(true)
  })

  it('input/textarea 聚焦时不打开', () => {
    expect(shouldOpenTerminal(kev({ tagName: 'INPUT' }), false)).toBe(false)
    expect(shouldOpenTerminal(kev({ tagName: 'TEXTAREA' }), false)).toBe(false)
  })

  it('已阻塞时不打开', () => {
    expect(shouldOpenTerminal(kev({ tagName: 'DIV' }), true)).toBe(false)
  })

  it('非 ~ 键不打开', () => {
    expect(shouldOpenTerminal({ key: 'a', target: { tagName: 'DIV' } }, false)).toBe(false)
  })

  it('target 为 null 不打开(防御)', () => {
    expect(shouldOpenTerminal(kev(null), false)).toBe(false)
  })
})
