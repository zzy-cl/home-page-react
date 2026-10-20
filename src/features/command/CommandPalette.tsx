import { useEffect, useRef, useState } from 'react';
import type { UiCommand } from '@/lib/command';
import { useUiStore } from '@/store/ui';
import { createCommands, type CommandNav } from './commands';
import { filterCommands } from './filter';

const PALETTE_HINT = '↑↓ 选择 · Enter 执行 · Esc 关闭';

interface CommandPaletteProps {
  /** 导航能力由应用外壳注入:面板挂在 RouterProvider 之外,拿不到 useNavigate */
  navigate: CommandNav;
}

/**
 * 全站指令面板(仅负责搜索、键盘导航与渲染)。
 * 命令表在 commands.ts(纯函数、可单测),本组件不再持有任何命令定义或副作用。
 */
export default function CommandPalette({ navigate }: CommandPaletteProps) {
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [toastMsg, setToastMsg] = useState<string>(PALETTE_HINT);

  // 面板内 toast 行:默认显示键位提示,命令反馈 2.6s 后回落(设计稿 palToast)。
  // 连续 toast 经 cleanup 重置计时,卸载自动清理。
  useEffect(() => {
    if (toastMsg === PALETTE_HINT) return;
    const timer = setTimeout(() => setToastMsg(PALETTE_HINT), 2600);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  // 命令表每次渲染重建(7 条,成本可忽略):
  // 项目已启用 React Compiler,这里刻意不再手写 useMemo/useCallback。
  const commands = createCommands({ navigate, toast: setToastMsg });
  const filtered: UiCommand[] = filterCommands(commands, query);

  // 打开/关闭即挂载/卸载(App 仅在 commandOpen 时渲染本组件):
  // 挂载记录焦点并聚焦输入,卸载恢复打开前焦点(设计稿 openPalette/closeOverlay)。
  useEffect(() => {
    lastFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    try {
      inputRef.current?.focus({ preventScroll: true });
    } catch {
      inputRef.current?.focus();
    }
    return () => {
      const el = lastFocus.current;
      if (el) {
        try {
          el.focus({ preventScroll: true });
        } catch {
          el.focus();
        }
      }
    };
  }, []);

  // 执行命令。keepOpen 命令(如主题切换)的"焦点还给输入框"由事件回调
  // 在调用后内联完成——ref 只允许在事件/副作用中直接读取(react-hooks/refs)
  const execute = (cmd: UiCommand | undefined) => {
    if (!cmd) return;
    if (!cmd.keepOpen) setCommandOpen(false);
    else {
      setQuery('');
      setActive(0);
    }
    cmd.action();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[active];
      execute(cmd);
      if (cmd?.keepOpen) inputRef.current?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandOpen(false);
    }
  };

  // 按 section 分组;顺带记录全局索引供高亮
  const sections = new Map<string, Array<{ cmd: UiCommand; idx: number }>>();
  filtered.forEach((cmd, idx) => {
    const list = sections.get(cmd.section) ?? [];
    list.push({ cmd, idx });
    sections.set(cmd.section, list);
  });

  return (
    <div
      className="md-overlay"
      onMouseDown={(e) => {
        // 点击遮罩关闭
        if (e.target === e.currentTarget) setCommandOpen(false);
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
              setQuery(e.target.value);
              setActive(0);
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
            [...sections.entries()].map(([section, list]) => (
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
  );
}
