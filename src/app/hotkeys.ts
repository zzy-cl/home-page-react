import { useEffect } from 'react';
import { useUiStore } from '@/store/ui';

/**
 * 全局快捷键(应用外壳只处理"通用"部分):
 * - Ctrl/Cmd+K 开关命令面板;
 * - Esc 关闭任意浮层。
 *
 * 终端专属的 ~/` 热键在 features/terminal/hotkey.ts,由 App 组合调用;
 * 外壳不再 import 任何 feature 的内部实现(依赖方向:app → feature 的 public 出口)。
 */
export function useGlobalHotkeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { commandOpen, terminalOpen, setCommandOpen, setTerminalOpen } = useUiStore.getState();

      // Ctrl/Cmd+K:开关面板
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(!commandOpen);
        return;
      }

      // Esc 关闭任意浮层
      if ((commandOpen || terminalOpen) && e.key === 'Escape') {
        e.preventDefault();
        setCommandOpen(false);
        setTerminalOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
