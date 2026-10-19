import { useEffect, useRef, useState } from 'react'
import { site } from '@/content/site'
import { ACCENTS } from '@/lib/accent'
import { useUiStore } from '@/store/ui'
import { executeCommand, type TerminalContext, type TerminalLine } from './commands'

/**
 * 终端模式(设计稿 .md-terminal):视口居中、CSS shake、
 * term-line 结构(prompt/ok/err)、↑ 历史带草稿保留、Esc/遮罩关闭。
 */
export default function Terminal() {
  const { terminalOpen, setTerminalOpen } = useUiStore()
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const historyIdx = useRef(-1)
  const draft = useRef('')
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<TerminalContext | null>(null)

  useEffect(() => {
    if (terminalOpen && !ctxRef.current) {
      const accentKey = (document.documentElement.getAttribute('data-accent') ?? 'blue') as
        | keyof typeof ACCENTS
        | string
      const conf = ACCENTS[accentKey as keyof typeof ACCENTS] ?? ACCENTS.blue
      ctxRef.current = {
        user: site.githubUser,
        siteName: site.name,
        host: 'zhaozeyu.top',
        keywords: [...site.keywords],
        buildTime: __BUILD_TIME__,
        siteStart: '2026-10-19',
        accentLabel: conf.label,
        accentHex: conf.hex,
      }
    }
    if (terminalOpen) {
      try {
        inputRef.current?.focus({ preventScroll: true })
      } catch {
        inputRef.current?.focus()
      }
    }
  }, [terminalOpen])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [lines])

  if (!terminalOpen) return null

  const run = (raw: string) => {
    const ctx = ctxRef.current!
    const echo: TerminalLine = { kind: 'input', text: raw.trim() }
    const out = executeCommand(raw, ctx)

    if (out.some((l) => l.text === '__CLEAR__')) {
      setLines([])
      setInput('')
      return
    }

    const shakeIt = out.some((l) => l.text === '__SHAKE__')
    const filtered = out.filter((l) => l.text !== '__SHAKE__' && l.text !== '__CLEAR__')
    setLines((cur) => [...cur, echo, ...filtered])
    setInput('')

    if (raw.trim()) {
      setHistory((h) => [raw.trim(), ...h])
      historyIdx.current = -1
      draft.current = ''
    }

    if (shakeIt) {
      setShake(true)
      setTimeout(() => setShake(false), 220)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      // 回溯时保留未提交草稿(设计稿 TERM_DRAFT)
      if (historyIdx.current === -1) draft.current = input
      const next = historyIdx.current === -1 ? history.length - 1 : Math.max(0, historyIdx.current - 1)
      historyIdx.current = next
      setInput(history[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx.current === -1) return
      historyIdx.current += 1
      if (historyIdx.current >= history.length) {
        historyIdx.current = -1
        setInput(draft.current)
      } else {
        setInput(history[historyIdx.current])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setTerminalOpen(false)
    }
  }

  return (
    <div
      className="md-overlay md-terminal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setTerminalOpen(false)
      }}
    >
      <div className={`md-terminal${shake ? ' shake' : ''}`} role="dialog" aria-modal="true" aria-label="终端模式">
        <div className="term-body" ref={bodyRef} aria-live="polite">
          {lines.map((l, i) => (
            <div key={i} className={`term-line${l.kind === 'error' ? ' err' : l.kind === 'input' ? ' input' : ' ok'}`}>
              {l.kind === 'input' ? (
                <>
                  <span className="prompt">$ </span>
                  {l.text}
                </>
              ) : (
                l.text
              )}
            </div>
          ))}
        </div>
        <div className="term-input-row">
          <span className="prompt" aria-hidden="true">
            $
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
            aria-label="终端命令输入"
          />
        </div>
        <div className="term-hint">Esc 关闭 · ↑ 回溯历史</div>
      </div>
    </div>
  )
}
