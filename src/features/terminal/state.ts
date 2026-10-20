import { useUiStore } from '@/store/ui';

/**
 * 打开终端(终端 feature 自己的打开语义):
 * 与命令面板互斥——先关面板再开终端,避免两个浮层叠在一起。
 * 该语义此前放在全局 store 里,会让 store 知道单个 feature 的业务。
 */
export function openTerminal(): void {
  useUiStore.setState({ commandOpen: false, terminalOpen: true });
}
