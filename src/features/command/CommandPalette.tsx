import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { UseNavigateResult } from '@tanstack/react-router'
import { site } from '@/content/site'
import { fetchHitokoto } from '@/features/hitokoto/api'
import { applyAccent, ACCENTS } from '@/lib/accent'
import { filterCommands, type Command } from './registry'
import { useUiStore } from '@/store/ui'

function buildCommands(navigate: UseNavigateResult<string>, toast: (msg: string) => void): Command[] {
  const cmds: Command[] = [
    {
      id: 'nav-home',
      title: '前往:首页',
      keywords: ['home', 'index', '首页'],
      section: '导航',
      action: () => void navigate({ to: '/' }),
    },
    {
      id: 'nav-uses',
      title: '前往:装备清单',
      keywords: ['uses', 'gear', '装备'],
      section: '导航',
      action: () => void navigate({ to: '/uses' }),
    },
    {
      id: 'nav-now',
      title: '前往:近况',
      keywords: ['now', '近况'],
      section: '导航',
      action: () => void navigate({ to: '/now' }),
    },
    {
      id: 'open-github',
      title: '打开:GitHub',
      keywords: ['github', '仓库', '代码'],
      section: '链接',
      action: () => window.open(site.github, '_blank', 'noopener'),
    },
    {
      id: 'terminal',
      title: '终端模式',
      keywords: ['terminal', '终端', 'shell'],
      section: '趣项',
      action: () => useUiStore.getState().openTerminal(),
    },
  ]
  // email 可选:site.email 未配置则不出现该命令
  if (site.email) {
    cmds.push({
      id: 'open-email',
      title: '打开:Email',
      keywords: ['email', '邮件', '联系'],
      section: '链接',
      action: () => window.open(`mailto:${site.email}`, '_self'),
    })
  }
  cmds.push({
    id: 'theme-accent',
    title: '主题:切换强调色',
    keywords: ['theme', 'accent', '颜色', '主题'],
    section: '主题',
    action: () => {
      const current = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
      const idx = ACCENTS.indexOf(current as (typeof ACCENTS)[number])
      const next = ACCENTS[(idx + 1) % ACCENTS.length]
      applyAccent(next)
      toast(`强调色已切换为 ${next}`)
    },
  })
  cmds.push({
    id: 'fun-fortune',
    title: '一言:来一条',
    keywords: ['fortune', '一言', '句子'],
    section: '趣项',
    action: () => {
      void fetchHitokoto().then((h) => toast(h ? `${h.text} —— ${h.from}` : '一言获取失败'))
    },
  })
  return cmds
}

export default function CommandPalette() {
  const navigate = useNavigate()
  const { commandOpen, setCommandOpen } = useUiStore()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // 轻提示:渲染在 dialog 之外的固定浮层——fortune 为异步结果、
  // theme 在执行后面板即关闭,toast 必须独立于 dialog 存活才能被看到
  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000)
  }, [])

  const commands = useMemo(() => buildCommands(navigate, toast), [navigate, toast])
  const filtered = useMemo(() => filterCommands(commands, query), [commands, query])

  // dialog 开关同步 store;打开时重置输入并聚焦
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    if (commandOpen && !dlg.open) {
      setQuery('')
      setActive(0)
      dlg.showModal()
      inputRef.current?.focus()
    } else if (!commandOpen && dlg.open) {
      dlg.close()
    }
  }, [commandOpen])

  // 原生 dialog 的 Esc/遮罩点击都会触发 close 事件,同步回 store
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    const onClose = () => setCommandOpen(false)
    dlg.addEventListener('close', onClose)
    return () => dlg.removeEventListener('close', onClose)
  }, [setCommandOpen])

  // 卸载时清掉未熄灭的 toast 定时器
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
  }, [])

  const execute = useCallback(
    (cmd: Command | undefined) => {
      if (!cmd) return
      setCommandOpen(false)
      cmd.action()
    },
    [setCommandOpen],
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      execute(filtered[active])
    }
  }

  // 按 section 分组展示
  const sections = useMemo(() => {
    const map = new Map<string, Command[]>()
    let idx = 0
    // 依赖 filtered 的顺序,顺便记录全局索引供高亮比对(避免 O(n²) indexOf)
    const indexed = filtered.map((cmd) => ({ cmd, idx: idx++ }))
    for (const { cmd } of indexed) {
      const list = map.get(cmd.section) ?? []
      list.push(cmd)
      map.set(cmd.section, list)
    }
    return [...map.entries()]
  }, [filtered])

  return (
    <>
      <dialog
        ref={dialogRef}
        className="glass-card m-auto w-[min(560px,92vw)] p-0 text-left backdrop:bg-black/60"
        style={{ color: 'var(--text-0)' }}
        onClick={(e) => {
          // 点击遮罩(事件目标是 dialog 自身)时关闭
          if (e.target === dialogRef.current) setCommandOpen(false)
        }}
      >
        <div
          className="flex items-center gap-2 border-b px-4 py-3"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <span className="mono text-xs" style={{ color: 'var(--text-2)' }}>
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
            className="mono w-full bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-0)' }}
          />
          <kbd className="mono text-xs" style={{ color: 'var(--text-2)' }}>
            Esc
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm" style={{ color: 'var(--text-2)' }}>
              无匹配命令
            </div>
          ) : (
            sections.map(([section, list]) => (
              <div key={section} className="mb-1">
                <div
                  className="mono px-3 py-1.5 text-[10px] tracking-widest"
                  style={{ color: 'var(--text-2)' }}
                >
                  {section}
                </div>
                {list.map((cmd) => {
                  const idx = filtered.indexOf(cmd)
                  const isActive = idx === active
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      className="flex w-full items-center rounded-[var(--radius-inner)] px-3 py-2 text-left text-sm"
                      style={{
                        background: isActive ? 'var(--glass-bg)' : 'transparent',
                        color: isActive ? 'var(--text-0)' : 'var(--text-1)',
                      }}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => execute(cmd)}
                    >
                      {cmd.title}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </dialog>

      {/* toast 独立于 dialog:面板关闭后反馈仍然可见 */}
      {toastMsg && (
        <div
          className="glass-card mono fixed bottom-16 left-1/2 z-[60] -translate-x-1/2 px-4 py-2 text-xs"
          style={{ color: 'var(--accent)', maxWidth: '90vw' }}
          role="status"
        >
          {toastMsg}
        </div>
      )}
    </>
  )
}
