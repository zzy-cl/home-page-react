export interface TerminalLine {
  kind: 'input' | 'output' | 'error'
  text: string
}

/** executeCommand 所需的站点快照(UI 层组装,纯函数只读) */
export interface TerminalContext {
  user: string
  siteName: string
  keywords: string[]
  now: { date: string; title: string } | null
  usesNames: string[]
  projects: Array<{ name: string; repo: string }>
  /** 构建时间戳(__BUILD_TIME__ 注入) */
  buildTime: string
  /** 建站日期 YYYY-MM-DD(运行天数由此计算) */
  siteStart: string
}

/**
 * `~` 键是否应打开终端(Review Focus 3):
 * 仅 ~ 键;input/textarea 聚焦、面板/终端已开(blocked)时不触发。
 * tagName 鸭子类型——避免引入 DOM 依赖,浏览器行为等价。
 */
export function shouldOpenTerminal(
  e: { key: string; target: unknown },
  blocked: boolean,
): boolean {
  if (e.key !== '~') return false
  if (blocked) return false
  // target 未知(异常场景)时防御性不触发
  const tag = (e.target as { tagName?: string } | null)?.tagName
  if (typeof tag !== 'string') return false
  return tag !== 'INPUT' && tag !== 'TEXTAREA'
}

const HELP_LINES = [
  '可用命令:',
  '  help              显示本帮助',
  '  whoami            我是谁',
  '  skills            技术栈',
  '  projects          精选项目',
  '  now               最近动态',
  '  uses              装备清单',
  '  fortune           来一条一言',
  '  neofetch          站点信息',
  '  clear             清屏',
  '  sudo rm -rf /     试试看?',
]

function daysSince(start: string): string {
  const ms = Date.now() - Date.parse(start)
  if (!Number.isFinite(ms)) return '?'
  return String(Math.floor(ms / 86_400_000))
}

/** 执行终端命令,返回输出行(fortune 返回占位行,真实内容由 UI 异步追加) */
export function executeCommand(input: string, ctx: TerminalContext): TerminalLine[] {
  const cmd = input.trim().toLowerCase()
  if (!cmd) return []

  switch (cmd) {
    case 'help':
      return HELP_LINES.map((text) => ({ kind: 'output' as const, text }))

    case 'whoami':
      return [
        { kind: 'output', text: `${ctx.user} —— 把想法变成代码的人` },
        { kind: 'output', text: `正在玩: ${ctx.keywords.join(' · ')}` },
      ]

    case 'skills':
      return [
        { kind: 'output', text: '┌─ 技术栈 ──────────────┐' },
        ...ctx.keywords.map((k, i) => ({
          kind: 'output' as const,
          text: `│ ${String(i + 1).padStart(2)} · ${k.padEnd(12)}│`,
        })),
        { kind: 'output', text: '└───────────────────────┘' },
      ]

    case 'projects':
      return [
        { kind: 'output', text: '精选项目:' },
        ...ctx.projects.map((p) => ({
          kind: 'output' as const,
          text: `  ${p.name}  →  github.com/${p.repo}`,
        })),
      ]

    case 'now':
      return ctx.now
        ? [{ kind: 'output', text: `[${ctx.now.date}] ${ctx.now.title}` }]
        : [{ kind: 'output', text: '暂无近况' }]

    case 'uses':
      return [
        { kind: 'output', text: '装备:' },
        ...ctx.usesNames.map((n) => ({ kind: 'output' as const, text: `  ${n}` })),
      ]

    case 'fortune':
      return [{ kind: 'output', text: '获取中...' }]

    case 'neofetch': {
      const days = daysSince(ctx.siteStart)
      return [
        { kind: 'output', text: `${ctx.siteName}@zhaozeyu.top` },
        { kind: 'output', text: '─────────────────────' },
        { kind: 'output', text: `OS:      呓语工位 (Glass 2.0)` },
        { kind: 'output', text: `Host:    zhaozeyu.top` },
        { kind: 'output', text: `Uptime:  ${days} 天` },
        { kind: 'output', text: `Build:   ${ctx.buildTime}` },
        { kind: 'output', text: `Stack:   ${ctx.keywords.join(', ')}` },
      ]
    }

    case 'clear':
      return [{ kind: 'output', text: '__CLEAR__' }]

    case 'sudo rm -rf /':
      return [
        { kind: 'error', text: '权限拒绝:这里是我的工位 :)' },
        { kind: 'output', text: '(屏幕抖了一下)' },
      ]

    default:
      return [
        { kind: 'error', text: `command not found: ${cmd},输入 help 查看可用命令` },
      ]
  }
}
