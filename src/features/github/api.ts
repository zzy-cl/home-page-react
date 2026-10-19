/** 单日贡献(热力图一格);date 为空串表示对齐占位格 */
export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

/** 一年贡献(热力图窗口) */
export interface ContributionYear {
  total: number;
  days: ContributionDay[];
}

/** 热力图窗口:最近一年(≤53 列 × 7 行) */
const WINDOW_DAYS = 365;

/**
 * 解析 github-contributions-api.jogruber.de v4 响应。
 * 实测坑(2026-10):对贡献稀疏的老账户,API 会返回账户有记录以来的
 * 全部年份(实测 2191 天),而非过去一年——必须裁剪窗口,否则
 * grid-flow-col 会渲染三百多列,格子带横穿整个视口。
 *
 * 行为:
 * - days 按日期升序(热力图列从左到右由旧到新)
 * - 首格对齐周日:窗口第一天之前的空位以 date='' 占位
 * - total 为窗口内 count 之和(不是各年 total 求和)
 * - level 夹取至 0-4;非法输入抛错(调用方负责降级为 null)
 */
export function parseContributions(payload: unknown): ContributionYear {
  const p = payload as {
    total?: Record<string, number>;
    contributions?: Array<{ date?: unknown; count?: unknown; level?: unknown }>;
  };

  if (!p || typeof p !== 'object' || !Array.isArray(p.contributions)) {
    throw new Error('invalid contributions payload');
  }

  // 升序排序后取最近 WINDOW_DAYS 天
  const sorted = [...p.contributions]
    .map((c) => ({
      date: String(c.date ?? ''),
      count: Number(c.count ?? 0) || 0,
      level: Math.min(4, Math.max(0, Math.floor(Number(c.level ?? 0) || 0))) as 0 | 1 | 2 | 3 | 4,
    }))
    .filter((c) => c.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const window = sorted.slice(-WINDOW_DAYS);

  // 首格对齐周日(UTC 口径,日期串即 UTC 日期)
  let lead = 0;
  if (window.length > 0) {
    lead = new Date(`${window[0].date}T00:00:00Z`).getUTCDay();
  }
  const pad = Array.from({ length: lead }, () => ({ date: '', count: 0, level: 0 as const }));

  const days: ContributionDay[] = [...pad, ...window];

  return {
    total: window.reduce((sum, d) => sum + d.count, 0),
    days,
  };
}

/** 拉取一年贡献;任何失败返回 null,不 throw(降级契约,Review Focus 1) */
export async function fetchContributions(user: string): Promise<ContributionYear | null> {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${user}`);
    if (!res.ok) return null;
    return parseContributions(await res.json());
  } catch {
    return null;
  }
}

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

/** 拉取单仓库 star 数(官方 REST,无认证);失败返回 null */
export async function fetchRepoStars(repo: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: unknown };
    const n = Number(data.stargazers_count);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
