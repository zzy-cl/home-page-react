import { create } from 'zustand';

/**
 * 浮层 UI 全局状态:Cmd+K 面板与终端开关。
 *
 * 只保留"开关"这一跨层事实(面板挂在 RouterProvider 之外,页面内组件拿不到
 * props,故需全局)。终端专属的打开语义(关面板 + 开终端)收归
 * features/terminal 的 public 出口,store 不再知道任何 feature 的业务。
 */
interface UiState {
  commandOpen: boolean;
  terminalOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  setTerminalOpen: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  commandOpen: false,
  terminalOpen: false,
  setCommandOpen: (v) => set({ commandOpen: v }),
  setTerminalOpen: (v) => set({ terminalOpen: v }),
}));
