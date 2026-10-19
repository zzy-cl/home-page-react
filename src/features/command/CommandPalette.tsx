import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { UseNavigateResult } from '@tanstack/react-router'
import { site } from '@/content/site'
import { applyAccent, nextAccentKey } from '@/lib/accent'
import { filterCommands } from './registry'
import type { Command } from './registry'
import { useUiStore } from '@/store/ui'

const PALETTE_HINT = '↑↓ 选择 · Enter 执行 · Esc 关闭'

interface UiCommand extends Command {
  desc: string
  hint: string
  /** 执行后面板保持打开(设计稿:主题切换需要看到 toast 反馈) */
  keepOpen?: boolean
}

function buildCommands(
  navigate: UseNavigateResult<string>,
  toast: (msg: string) => void,
): UiCommand[] {
  const cmds: UiCommand[] = [
    {
      id: 'nav-home',
      title: '前往:首页',
      desc: '回到 Bento 工位',
      hint: 'index',
      keywords: ['home', 'index', '首页', '工位', 'bento'],
      section: '导航',
      action: () => void navigate({ to: '/' }),
    },
    {
      id: 'nav-uses',
      title: '前往:装备清单',
      desc: '硬件、工具与技术栈',
      hint: '/uses',
      keywords: ['uses', 'gear', '装备', '工具', '技术栈'],
      section: '导航',
      action: () => void navigate({ to: '/uses' }),
    },
    {
      id: 'nav-now',
      title: '前往:近况',
      desc: '最近在折腾什么',
      hint: '/now',
      keywords: ['now', '近况', '动态'],
      section: '导航',
      action: () => void navigate({ to: '/now' }),
    },
    {
      id: 'open-github',
      title: '打开:GitHub',
      desc: `github.com/${site.githubUser},新窗口打开`,
      hint: '↗',
      keywords: ['github', '仓库', '开源', site.githubUser],
      section: '链接',
      action: () => window.open(site.github, '_blank', 'noopener'),
    },
    {
      id: 'theme-accent',
      title: '切换强调色',
      desc: '静谧蓝 → 暖橙 → 紫罗兰,立即全站生效',
      hint: '蓝→橙→紫',
      keywords: ['theme', 'accent', '主题', '颜色', '蓝', '橙', '紫'],
      section: '主题',
      keepOpen: true,
      action: () => {
        const current = document.documentElement.getAttribute('data-accent') ?? 'blue'
        const next = nextAccentKey(current)
        const msg = applyAccent(next, true)
        if (msg) toast(msg)
      },
    },
    {
      id: 'terminal',
      title: '终端模式',
      desc: '极客彩蛋,输入 help 看看',
      hint: '~',
      keywords: ['terminal', '终端', 'shell', '彩蛋'],
      section: '趣项',
      action: () => useUiStore.getState().openTerminal(),
    },
    {
      id: 'fun-quote',
      title: '一言:来一条',
      desc: '换一句话',
      hint: '↻',
      keywords: ['quote', '一言', 'hitokoto', '换'],
      section: '趣项',
      action: () => {
        // 面板内 toast 反馈;一言卡在首页,若不在首页则先回去
        void import('@/features/hitokoto/api').then(({ fetchHitokoto }) =>
          fetchHitokoto().then((h) => toast(h ? `${h.text} —— ${h.from}` : '一言获取失败')),
        )
        if (window.location.pathname !== '/') void navigate({ to: '/' })
      },
    },
  ]
  // email 可选:site.email 未配置则不出现该命令
  if (site.email) {
    cmds.splice(4, 0, {
      id: 'open-email',
      title: '打开:Email',
      desc: '来封邮件聊聊',
      hint: '✉',
      keywords: ['email', '邮件', '联系'],
      section: '链接',
      action: () => window.open(`mailto:${site.email}`, '_self'),
    })
  }
  return cmds
}

export default function CommandPalette() {
  const navigate = useNavigate()
  const { commandOpen, setCommandOpen } = useUiStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [toastMsg, setToastMsg] = useState<string>(PALETTE_HINT)

  // 面板内 toast 行:默认显示键位提示,命令反馈 2.6s 后回落(设计稿 palToast)
  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(PALETTE_HINT), 2600)
  }, [])

  const commands = useMemo(() => buildCommands(navigate, toast), [navigate, toast])
  const filtered = useMemo(
    () => filterCommands(commands as Command[], query) as UiCommand[],
    [commands, query],
  )

  // 打开/关闭同步:输入重置、焦点进入与恢复(设计稿 openPalette/closeOverlay)
  useEffect(() => {
    if (commandOpen) {
      lastFocus.current = document.activeElement as HTMLElement | null
      setQuery('')
      setActive(0)
      setToastMsg(PALETTE_HINT)
      try {
        inputRef.current?.focus({ preventScroll: true })
      } catch {
        inputRef.current?.focus()
      }
    } else if (lastFocus.current) {
      try {
        lastFocus.current.focus({ preventScroll: true })
      } catch {
        lastFocus.current.focus()
      }
      lastFocus.current = null
    }
  }, [commandOpen])

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    },
    [],
  )

  const execute = useCallback(
    (cmd: UiCommand | undefined) => {
      if (!cmd) return
      if (!cmd.keepOpen) setCommandOpen(false)
      else {
        setQuery('')
        setActive(0)
      }
      cmd.action()
      if (cmd.keepOpen) inputRef.current?.focus()
    },
    [setCommandOpen],
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (filtered.length ? (i + 1) % filtered.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      execute(filtered[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setCommandOpen(false)
    }
  }

  // 按 section 分组;顺带记录全局索引供高亮
  const sections = useMemo(() => {
    const map = new Map<string, Array<{ cmd: UiCommand; idx: number }>>()
    filtered.forEach((cmd, idx) => {
      const list = map.get(cmd.section) ?? []
      list.push({ cmd, idx })
      map.set(cmd.section, list)
    })
    return [...map.entries()]
  }, [filtered])

  if (!commandOpen) return null

  return (
    <div
      className="md-overlay"
      onMouseDown={(e) => {
        // 点击遮罩关闭
        if (e.target === e.currentTarget) setCommandOpen(false)
      }}
    >
      <div className="md-palette" role="dialog" aria-modal="true" aria-label="全站指令面板">
        <div className="palette-input">
          <span className="palette-prefix" aria-hidden="true">
            &gt;
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="输入命令或搜索…"
            autoComplete="off"
            spellCheck={false}
            aria-label="搜索命令"
          />
        </div>

        <div className="palette-list" role="listbox" aria-label="命令列表">
          {filtered.length === 0 ? (
            <div className="palette-empty">没有匹配的命令,试试 help / theme / go</div>
          ) : (
            sections.map(([section, list]) => (
              <div key={section}>
                <div className="group-label">{section}</div>
                {list.map(({ cmd, idx }) => (
                  <button
                    key={cmd.id}
                    type="button"
                    role="option"
                    aria-selected={idx === active}
                    className={`cmd${idx === active ? ' sel' : ''}`}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => execute(cmd)}
                  >
                    <span className="cmd-main">
                      <span>{cmd.title}</span>
                      <span className="cmd-desc">{cmd.desc}</span>
                    </span>
                    <span className="cmd-hint">{cmd.hint}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

      <div className="palette-toast" aria-live="polite">
        {toastMsg}
      </div>
      </div>
    </div>
  )
}
