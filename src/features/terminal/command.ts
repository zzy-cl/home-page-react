import type { UiCommand } from '@/lib/command';
import { openTerminal } from './state';

/**
 * 终端在 Cmd+K 面板里的条目。
 * 命令的"是什么"由拥有它的 feature 声明,command feature 只负责汇总,
 * 新增/删除终端不再需要改面板组件。
 */
export const terminalCommand: UiCommand = {
  id: 'terminal',
  title: '终端模式',
  desc: '极客彩蛋,输入 help 看看',
  hint: '~',
  keywords: ['terminal', '终端', 'shell', '彩蛋'],
  section: '趣项',
  action: openTerminal,
};
