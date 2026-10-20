import { describe, expect, it, vi } from 'vitest';
import type { UiCommand } from '@/lib/command';
import { createCommands } from './commands';

const deps = () => ({ navigate: vi.fn(), toast: vi.fn() });

function findCmd(cmds: UiCommand[], id: string): UiCommand {
  const cmd = cmds.find((c) => c.id === id);
  if (!cmd) throw new Error(`missing command: ${id}`);
  return cmd;
}

describe('createCommands(命令表独立于面板组件,可直接单测)', () => {
  it('按 导航/链接/主题/趣项 分组且 id 唯一', () => {
    const { navigate, toast } = deps();
    const cmds = createCommands({ navigate, toast });
    expect([...new Set(cmds.map((c) => c.section))]).toEqual(['导航', '链接', '主题', '趣项']);
    expect(new Set(cmds.map((c) => c.id)).size).toBe(cmds.length);
  });

  it('导航命令调用注入的 navigate,不直接依赖 router', () => {
    const { navigate, toast } = deps();
    const cmds = createCommands({ navigate, toast });
    findCmd(cmds, 'nav-home').action();
    findCmd(cmds, 'nav-uses').action();
    findCmd(cmds, 'nav-now').action();
    expect(navigate.mock.calls).toEqual([['/'], ['/uses'], ['/now']]);
  });

  it('主题命令 keepOpen 并通过 toast 反馈', () => {
    const { navigate, toast } = deps();
    const theme = findCmd(createCommands({ navigate, toast }), 'theme-accent');
    expect(theme.keepOpen).toBe(true);
    theme.action();
    expect(toast).toHaveBeenCalledWith(expect.stringContaining('强调色已切换'));
  });

  it('终端命令由 terminal feature 提供,面板只汇总', () => {
    const { navigate, toast } = deps();
    const terminal = findCmd(createCommands({ navigate, toast }), 'terminal');
    expect(terminal.section).toBe('趣项');
    expect(terminal.hint).toBe('~');
  });

  it('未配置 site.email 时不暴露 Email 命令', () => {
    const { navigate, toast } = deps();
    expect(createCommands({ navigate, toast }).some((c) => c.id === 'open-email')).toBe(false);
  });
});
