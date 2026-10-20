import { useEffect, useRef, useState } from 'react';
import { site } from '@/content/site';
import { currentAccentConf } from '@/lib/accent';
import { useUiStore } from '@/store/ui';
import { executeCommand, type TerminalContext, type TerminalLine } from './commands';

/**
 * 终端模式(设计稿 .md-terminal):视口居中、CSS shake、
 * term-line 结构(prompt/ok/err)、↑ 历史带草稿保留、Esc/遮罩关闭。
 *
 * 组件只由 App 在 terminalOpen 时挂载,故"挂载即打开"。
 * 终端上下文每次执行命令时现取(accent 可能在面板里被改过),
 * 不缓存到 ref,避免主题切换后 neofetch 仍显示旧色。
 */
function buildContext(): TerminalContext {
  const accent = currentAccentConf();
  return {
    user: site.githubUser,
    siteName: site.name,
    host: site.host,
    keywords: [...site.keywords],
    buildTime: __BUILD_TIME__,
    siteStart: site.siteStart,
    accentLabel: accent.label,
    accentHex: accent.hex,
  };
}

export default function Terminal() {
  const terminalOpen = useUiStore((s) => s.terminalOpen);
  const setTerminalOpen = useUiStore((s) => s.setTerminalOpen);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  /** -1 = 停在使用中的草稿;否则为 history 下标(0 最新、末尾最旧) */
  const historyIdx = useRef(-1);
  const draft = useRef('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // 挂载即聚焦(组件由 App 条件挂载)
  useEffect(() => {
    try {
      inputRef.current?.focus({ preventScroll: true });
    } catch {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  if (!terminalOpen) return null;

  const run = (raw: string) => {
    const echo: TerminalLine = { kind: 'input', text: raw.trim() };
    const out = executeCommand(raw, buildContext());

    if (out.some((l) => l.text === '__CLEAR__')) {
      setLines([]);
      setInput('');
      return;
    }

    const shakeIt = out.some((l) => l.text === '__SHAKE__');
    const filtered = out.filter((l) => l.text !== '__SHAKE__' && l.text !== '__CLEAR__');
    setLines((cur) => [...cur, echo, ...filtered]);
    setInput('');

    if (raw.trim()) {
      setHistory((h) => [raw.trim(), ...h]);
      historyIdx.current = -1;
      draft.current = '';
    }

    if (shakeIt) setShake(true);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      // 首次回溯先保留未提交草稿;history[0] 是最新一条,↑ 向更旧走
      if (historyIdx.current === -1) draft.current = input;
      historyIdx.current = Math.min(history.length - 1, historyIdx.current + 1);
      setInput(history[historyIdx.current]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx.current === -1) return;
      historyIdx.current -= 1;
      if (historyIdx.current < 0) {
        historyIdx.current = -1;
        setInput(draft.current);
      } else {
        setInput(history[historyIdx.current]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setTerminalOpen(false);
    }
  };

  return (
    <div
      className="md-overlay md-terminal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setTerminalOpen(false);
      }}
    >
      <div
        className={`md-terminal${shake ? ' shake' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="终端模式"
        // shake 由动画本身结束(md-shake),无需定时器
        onAnimationEnd={(e) => {
          if (e.animationName === 'md-shake') setShake(false);
        }}
      >
        <div className="term-body" ref={bodyRef} aria-live="polite">
          {lines.map((l, i) => (
            <div
              // 终端日志是纯追加列表,无重排/插入,index key 语义稳定
              key={i}
              className={`term-line${l.kind === 'error' ? ' err' : l.kind === 'input' ? ' input' : ' ok'}`}
            >
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
  );
}
