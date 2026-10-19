import { create } from 'zustand';

/** 浮层 UI 全局状态:Cmd+K 面板与终端(终端彩蛋从任何页面可呼出,故需全局) */
interface UiState {
  commandOpen: boolean;
  terminalOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  setTerminalOpen: (v: boolean) => void;
  /** 打开终端并联动关闭面板(Cmd+K 内 Terminal 命令,Review Focus 3) */
  openTerminal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  commandOpen: false,
  terminalOpen: false,
  setCommandOpen: (v) => set({ commandOpen: v }),
  setTerminalOpen: (v) => set({ terminalOpen: v }),
  openTerminal: () => set({ commandOpen: false, terminalOpen: true }),
}));
