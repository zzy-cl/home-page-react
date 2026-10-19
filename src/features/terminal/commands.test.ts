import { describe, expect, it } from 'vitest';
import {
  executeCommand,
  formatBuildTime,
  shouldOpenTerminal,
  type TerminalContext,
} from './commands';

const ctx: TerminalContext = {
  user: 'zzy-cl',
  siteName: '呓语小屋',
  host: 'zhaozeyu.top',
  keywords: ['Vue3', 'React', 'Rust', 'TypeScript', 'AI', 'Vibe Coding'],
  buildTime: '2026-10-19T09:48:00.000Z',
  siteStart: '2026-10-19',
  accentLabel: '静谧蓝',
  accentHex: '#7aa2ff',
};

/** 伪键盘事件(node 环境,无 DOM) */
const kev = (target: { tagName?: string } | null) => ({ key: '~', target });

describe('executeCommand(设计稿命令集:help/whoami/skills/neofetch/clear/sudo)', () => {
  it('help 列出全部命令', () => {
    const lines = executeCommand('help', ctx);
    const text = lines.map((l) => l.text).join('\n');
    expect(text).toContain('whoami');
    expect(text).toContain('skills');
    expect(text).toContain('neofetch');
    expect(text).toContain('sudo');
  });

  it('whoami 含用户名与身份句', () => {
    const text = executeCommand('whoami', ctx)
      .map((l) => l.text)
      .join('\n');
    expect(text).toContain('zzy-cl');
    expect(text).toContain('把想法变成代码的人');
  });

  it('skills 输出两列 ASCII 表(含边框与关键词)', () => {
    const lines = executeCommand('skills', ctx);
    const text = lines.map((l) => l.text).join('\n');
    expect(text).toContain('┌');
    expect(text).toContain('Vue3');
    expect(text).toContain('Vibe Coding');
  });

  it('neofetch 含 OS/Host/Uptime/Shell/Build/Accent 行', () => {
    const text = executeCommand('neofetch', ctx)
      .map((l) => l.text)
      .join('\n');
    expect(text).toContain('呓语小屋@zhaozeyu.top');
    expect(text).toContain('Uptime:');
    expect(text).toContain('Shell:   monologue-sh 1.0');
    expect(text).toContain('Build:   2026-10-19 09:48:00');
    expect(text).toContain('静谧蓝 #7aa2ff');
  });

  it('sudo rm -rf / 触发 shake 信号与彩蛋文案', () => {
    const lines = executeCommand('sudo rm -rf /', ctx);
    expect(lines.some((l) => l.text === '__SHAKE__')).toBe(true);
    expect(lines.some((l) => l.text.includes('权限拒绝'))).toBe(true);
  });

  it('clear 输出清屏信号', () => {
    expect(executeCommand('clear', ctx).some((l) => l.text === '__CLEAR__')).toBe(true);
  });

  it('未知命令报 command not found', () => {
    const [l] = executeCommand('foo', ctx);
    expect(l.kind).toBe('error');
    expect(l.text).toContain('command not found: foo');
  });

  it('空输入返回空数组', () => expect(executeCommand('   ', ctx)).toEqual([]));

  it('命令大小写不敏感', () => {
    expect(executeCommand('HELP', ctx).length).toBeGreaterThan(0);
  });

  it('sudo 变体(任意含 sudo 与 rm 的输入)同样触发彩蛋', () => {
    const lines = executeCommand('sudo rm -rf /*', ctx);
    expect(lines.some((l) => l.text.includes('权限拒绝'))).toBe(true);
  });
});

describe('shouldOpenTerminal', () => {
  it('普通目标且未阻塞时打开', () => {
    expect(shouldOpenTerminal(kev({ tagName: 'DIV' }), false)).toBe(true);
  });

  it('~ 与 ` 均可触发', () => {
    expect(shouldOpenTerminal({ key: '`', target: { tagName: 'DIV' } }, false)).toBe(true);
  });

  it('input/textarea 聚焦时不打开', () => {
    expect(shouldOpenTerminal(kev({ tagName: 'INPUT' }), false)).toBe(false);
    expect(shouldOpenTerminal(kev({ tagName: 'TEXTAREA' }), false)).toBe(false);
  });

  it('已阻塞时不打开', () => {
    expect(shouldOpenTerminal(kev({ tagName: 'DIV' }), true)).toBe(false);
  });

  it('按住修饰键不触发(避免与系统快捷键冲突)', () => {
    expect(shouldOpenTerminal({ key: '~', target: { tagName: 'DIV' }, ctrlKey: true }, false)).toBe(
      false,
    );
    expect(shouldOpenTerminal({ key: '~', target: { tagName: 'DIV' }, metaKey: true }, false)).toBe(
      false,
    );
  });

  it('非 ~ 键不打开', () => {
    expect(shouldOpenTerminal({ key: 'a', target: { tagName: 'DIV' } }, false)).toBe(false);
  });

  it('target 为 null 不打开(防御)', () => {
    expect(shouldOpenTerminal(kev(null), false)).toBe(false);
  });
});

describe('formatBuildTime', () => {
  it('ISO 时间戳转为 YYYY-MM-DD HH:mm:ss(纯截取,不做时区换算)', () => {
    expect(formatBuildTime('2026-10-19T09:48:00.000Z')).toBe('2026-10-19 09:48:00');
  });

  it('非 ISO 输入原样返回(兜底)', () => {
    expect(formatBuildTime('dev')).toBe('dev');
    expect(formatBuildTime('')).toBe('');
  });
});
