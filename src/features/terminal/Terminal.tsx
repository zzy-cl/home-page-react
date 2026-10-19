import { useEffect, useRef, useState } from 'react'
import { site } from '@/content/site'
import { useSections } from '@/content/uses'
import { loadNowEntries } from '@/lib/md'
import { projects } from '@/content/projects.data'
import { fetchHitokoto } from '@/features/hitokoto/api'
import { useUiStore } from '@/store/ui'
import { executeCommand, type TerminalContext, type TerminalLine } from './commands'

/** 站点快照(渲染期取一次即可,均为构建期常量) */
function buildContext(): TerminalContext {
  const latest = loadNowEntries()[0]
  return {
    user: site.githubUser,
    siteName: site.name,
    keywords: [...site.keywords],
    now: latest ? { date: latest.date, title: latest.title } : null,
    usesNames: useSections.flatMap((s) => s.items.map((i) => i.name)),
    projects: projects.map((p) => ({ name: p.name, repo: p.repo })),
    buildTime: __BUILD_TIME__,
    siteStart: '2026-10-19',
  }
}

export default function Terminal() {
  const { terminalOpen, setTerminalOpen } = useUiStore()
  const [lines, setLines] = useState<TerminalLine[]>([
    { kind: 'output', text: `${site.name} 伪终端 v1.0 — 输入 help 查看命令` },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const historyIdx = useRef(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<TerminalContext | null>(null)

  // 打开时聚焦并滚到底
  useEffect(() => {
    if (terminalOpen) {
      if (!ctxRef.current) ctxRef.current = buildContext()
      inputRef.current?.focus()
    }
  }, [terminalOpen])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  if (!terminalOpen) return null

  const run = (raw: string) => {
    const out = executeCommand(raw, ctxRef.current!)
    const inputLine: TerminalLine = { kind: 'input', text: raw.trim() }
    let next = [...lines, inputLine]

    // clear 命令:清空历史输出
    if (out.some((l) => l.text === '__CLEAR__')) {
      next = []
      setLines(next)
      setInput('')
      return
    }
    next = [...next, ...out]

    // fortune:异步取真实一言,追加输出
    if (raw.trim().toLowerCase() === 'fortune') {
      void fetchHitokoto().then((h) => {
        setLines((cur) => [
          ...cur,
          h
            ? { kind: 'output', text: `${h.text} —— ${h.from}` }
            : { kind: 'error', text: '一言获取失败' },
        ])
      })
    }

    // sudo 彩蛋:屏幕轻抖(仅 transform,红线内)
    if (raw.trim().toLowerCase() === 'sudo rm -rf /') {
      const el = document.getElementById('terminal-window')
      if (el) {
        el.animate(
          [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-4px)' },
            { transform: 'translateX(4px)' },
            { transform: 'translateX(0)' },
          ],
          { duration: 200 },
        )
      }
    }

    setLines(next)
    setInput('')
    if (raw.trim()) setHistory((h) => [raw.trim(), ...h])
    historyIdx.current = -1
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(historyIdx.current + 1, history.length - 1)
      if (next >= 0) {
        historyIdx.current = next
        setInput(history[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = historyIdx.current - 1
      historyIdx.current = next
      setInput(next >= 0 ? history[next] : '')
    } else if (e.key === 'Escape') {
      setTerminalOpen(false)
    }
  }

  const colorOf = (kind: TerminalLine['kind']) =>
    kind === 'error' ? '#ff6b6b' : kind === 'input' ? 'var(--accent)' : 'var(--text-1)'

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={() => setTerminalOpen(false)}
    >
      <div
        id="terminal-window"
        className="glass-card mono mt-[10vh] w-[min(720px,92vw)] p-6 text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={scrollRef} className="max-h-[60vh] min-h-[300px] overflow-y-auto">
          {lines.map((l, i) => (
            <div key={i} className="whitespace-pre-wrap" style={{ color: colorOf(l.kind) }}>
              {l.kind === 'input' ? `$ ${l.text}` : l.text}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
          <span>$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="mono w-full bg-transparent outline-none"
            style={{ color: 'var(--text-0)' }}
            autoComplete="off"
            spellCheck={false}
            aria-label="终端输入"
          />
        </div>
        <div className="mt-3 text-[10px]" style={{ color: 'var(--text-2)' }}>
          Esc 关闭 · ↑ 回溯历史
        </div>
      </div>
    </div>
  )
}
