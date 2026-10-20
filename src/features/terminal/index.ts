/**
 * terminal feature 的 public 出口。
 *
 * 只导出热键、打开函数与命令条目;Terminal 组件不进此出口——
 * App 若静态 import 本文件,经 barrel 会把组件拉进主包,破坏懒加载分包。
 * 组件的唯一入口是 App 中的动态 import('./Terminal')。
 */
export { useTerminalHotkey } from './hotkey';
export { openTerminal } from './state';
export { terminalCommand } from './command';
