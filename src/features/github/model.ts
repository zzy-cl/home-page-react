import type { ContributionDay, ContributionStats } from './types';

/**
 * 展示模型(纯函数、无 I/O)。
 * 与 api.ts 分离:组件只依赖"如何把数据映射成 UI 状态",
 * 不依赖"如何从网络取数据",因此 UI → model,而不是 UI → service。
 */

/**
 * days → 设计稿渲染数据(levels 数组):
 * 占位格与零贡献 → 0;count 按 GitHub 官方阈值映射 1-4;
 * today 之后的尾位(周末对齐余格)→ -1(future,渲染为近透明)。
 * 阈值:1-2 → 1,3-5 → 2,6-9 → 3,10+ → 4
 */
export function toHeatmapLevels(
  days: ContributionDay[],
  todayIndex: number,
): Array<-1 | 0 | 1 | 2 | 3 | 4> {
  return days.map((d, i) => {
    if (i > todayIndex) return -1;
    if (!d.date || d.count <= 0) return 0;
    if (d.count <= 2) return 1;
    if (d.count <= 5) return 2;
    if (d.count <= 9) return 3;
    return 4;
  });
}

export function deriveStats(days: ContributionDay[]): ContributionStats {
  const real = days.filter((d) => d.date);
  const cutoff = real.at(-1)?.date ?? null;
  const active = real.filter((d) => d.count > 0);
  const best = real.reduce((m, d) => Math.max(m, d.count), 0);

  // 连击:跳过尾部无贡献日,从最近一次有贡献起向前数连续;占位格不参与
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const d = days[i];
    if (!d.date) continue;
    if (d.count > 0) streak++;
    else if (streak > 0) break;
  }

  let lastActiveLabel = '—';
  const lastActive = active.at(-1)?.date;
  if (cutoff && lastActive) {
    const diff = Math.round((Date.parse(cutoff) - Date.parse(lastActive)) / 86_400_000);
    lastActiveLabel = diff <= 0 ? '今天' : diff === 1 ? '昨天' : `${diff} 天前`;
  }

  return {
    streak,
    best,
    activeDays: active.length,
    totalDays: real.length,
    lastActiveLabel,
  };
}
