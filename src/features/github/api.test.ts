import { describe, expect, it } from 'vitest';
import { parseContributions, parseStarsDirect, parseStarsShields, parseStarsUngh } from './api';

const valid = {
  total: { '2026': 12 },
  contributions: [
    { date: '2026-01-01', count: 3, level: 1 },
    { date: '2026-01-02', count: 9, level: 4 },
  ],
};

/** 构造 n 天连续日期(截至 2026-10-19,倒序如 jogruber 真实返回) */
function makeDays(n: number, countPerDay = 1) {
  const out: Array<{ date: string; count: number; level: number }> = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.UTC(2026, 9, 19));
    d.setUTCDate(d.getUTCDate() - i);
    out.push({ date: d.toISOString().slice(0, 10), count: countPerDay, level: 1 });
  }
  return out;
}

describe('parseContributions', () => {
  it('解析合法 payload(2026-01-01 为周四,前有 4 个对齐占位)', () => {
    const y = parseContributions(valid);
    expect(y.days).toHaveLength(4 + 2);
    expect(y.days.at(-1)).toEqual({ date: '2026-01-02', count: 9, level: 4 });
  });

  it('total 为窗口内贡献之和,而非各年 total 求和', () => {
    expect(parseContributions(valid).total).toBe(12);
  });

  it('非法 payload 抛错', () => {
    expect(() => parseContributions({})).toThrow('invalid contributions payload');
    expect(() => parseContributions({ total: {}, contributions: 'no' })).toThrow();
  });

  it('多年数据裁剪到最近一年(≤371 格)——jogruber 对老账户返回全部年份', () => {
    const y = parseContributions({
      total: { '2021': 1, '2026': 106 },
      contributions: makeDays(2191),
    });
    expect(y.days.length).toBeLessThanOrEqual(371);
    expect(y.total).toBe(y.days.filter((d) => d.date).length);
  });

  it('首格对齐周日(空格占位),days 升序', () => {
    const y = parseContributions({ total: {}, contributions: makeDays(365) });
    expect(y.days[0].date).toBe('');
    expect(y.days[1].date).toBe('2025-10-20');
    const dates = y.days.filter((d) => d.date).map((d) => d.date);
    expect([...dates].sort()).toEqual(dates);
  });
});

describe('star 兜底链解析器(官方 / shields.io / ungh.cc)', () => {
  it('parseStarsDirect:取 stargazers_count 数值', () => {
    expect(parseStarsDirect({ stargazers_count: 5 })).toBe(5);
    expect(parseStarsDirect({ stargazers_count: 'x' })).toBeNull();
    expect(parseStarsDirect({})).toBeNull();
    expect(parseStarsDirect(null)).toBeNull();
  });

  it('parseStarsShields:只接受纯数字字符串(value ≥1k 会被缩写,视为失败走下一级)', () => {
    expect(parseStarsShields({ value: '0' })).toBe(0);
    expect(parseStarsShields({ value: '42' })).toBe(42);
    expect(parseStarsShields({ value: '1.2k' })).toBeNull();
    expect(parseStarsShields({ value: 12 })).toBeNull(); // 非字符串
    expect(parseStarsShields({})).toBeNull();
  });

  it('parseStarsUngh:取 repo.stars 数值', () => {
    expect(parseStarsUngh({ repo: { stars: 7 } })).toBe(7);
    expect(parseStarsUngh({ repo: {} })).toBeNull();
    expect(parseStarsUngh({})).toBeNull();
    expect(parseStarsUngh(null)).toBeNull();
  });
});
