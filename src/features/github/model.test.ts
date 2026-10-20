import { describe, expect, it } from 'vitest';
import { deriveStats, toHeatmapLevels } from './model';
import type { ContributionDay } from './types';

const d = (date: string, count: number): ContributionDay => ({ date, count, level: 0 });

describe('toHeatmapLevels(设计稿渲染数据:counts + levels 数组,future=-1)', () => {
  it('按 GitHub 官方阈值把 count 映射为 0-4', () => {
    const days: ContributionDay[] = [
      d('', 0),
      d('2026-01-02', 0),
      d('2026-01-03', 2),
      d('2026-01-04', 4),
      d('2026-01-05', 7),
      d('2026-01-06', 12),
    ];
    expect(toHeatmapLevels(days, 4)).toEqual([0, 0, 1, 2, 3, -1]);
  });

  it('占位格映射为 0', () => {
    expect(toHeatmapLevels([d('', 0), d('2026-01-02', 5)], 2)).toEqual([0, 2]);
  });
});

describe('deriveStats(热力图衍生统计)', () => {
  it('连击/单日最高/活跃天数按窗口计算,截止日有贡献时最近提交为"今天"', () => {
    const s = deriveStats([
      d('', 0), // 首列对齐占位,不参与统计
      d('2026-10-15', 1),
      d('2026-10-16', 0),
      d('2026-10-17', 3),
      d('2026-10-18', 3),
      d('2026-10-19', 2),
    ]);
    expect(s.streak).toBe(3); // 17-19 连续,中间的 16 号空档不连
    expect(s.best).toBe(3);
    expect(s.activeDays).toBe(4); // 15/17/18/19 共 4 天
    expect(s.totalDays).toBe(5); // 占位格不计
    expect(s.lastActiveLabel).toBe('今天');
  });

  it('截止日没提交时,连击以最近一次有贡献收尾,文案相对截止日', () => {
    const s = deriveStats([d('2026-10-17', 2), d('2026-10-18', 0), d('2026-10-19', 0)]);
    expect(s.streak).toBe(1);
    expect(s.best).toBe(2);
    expect(s.activeDays).toBe(1);
    expect(s.lastActiveLabel).toBe('2 天前');
  });

  it('昨天有提交时文案为"昨天"', () => {
    const s = deriveStats([d('2026-10-18', 1), d('2026-10-19', 0)]);
    expect(s.lastActiveLabel).toBe('昨天');
  });

  it('窗口内无任何贡献 → 全零 + 占位文案', () => {
    const s = deriveStats([d('2026-10-18', 0), d('2026-10-19', 0)]);
    expect(s).toEqual({
      streak: 0,
      best: 0,
      activeDays: 0,
      totalDays: 2,
      lastActiveLabel: '—',
    });
  });

  it('空数组降级', () => {
    expect(deriveStats([]).lastActiveLabel).toBe('—');
    expect(deriveStats([]).totalDays).toBe(0);
  });
});
