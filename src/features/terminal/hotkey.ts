import { useEffect } from 'react';
import { useUiStore } from '@/store/ui';

/**
 * `~`(或 `` ` ``)键是否应打开终端:
 * 仅 ~ 或 `;按住 Ctrl/Cmd/Alt 不触发;input/textarea 聚焦、
 * 面板/终端已开(blocked)时不触发;target 未知时防御性不触发。
 * tagName 鸭子类型——纯函数不依赖 DOM,单测可在 node 环境直接跑。
 */
export function shouldOpenTerminal(
  e: { key: string; target: unknown; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean },
  blocked: boolean,
): boolean {
  if (e.key !== '~' && e.key !== '`') return false;
  if (blocked) return false;
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  const tag = (e.target as { tagName?: string } | null)?.tagName;
  if (typeof tag !== 'string') return false;
  return tag !== 'INPUT' && tag !== 'TEXTAREA';
}

/**
 * 终端热键(局部于 feature):应用外壳不再需要知道终端的触发键。
 * 仅监听 ~/`;Ctrl+K 与 Esc 由 app/hotkeys 统一处理。
 */
export function useTerminalHotkey(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { commandOpen, terminalOpen, setTerminalOpen } = useUiStore.getState();
      const target = e.target;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (shouldOpenTerminal(e, commandOpen || terminalOpen || typing)) {
        e.preventDefault();
        setTerminalOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
