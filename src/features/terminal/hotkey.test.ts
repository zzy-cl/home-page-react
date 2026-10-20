import { describe, expect, it } from 'vitest';
import { shouldOpenTerminal } from './hotkey';

/** 伪键盘事件(node 环境,无 DOM) */
const kev = (target: { tagName?: string } | null) => ({ key: '~', target });

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
