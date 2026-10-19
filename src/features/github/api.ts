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

/** 热力图衍生统计(纯前端从 days 计算,零额外请求);数据降级时 UI 显示占位符 */
export interface ContributionStats {
  /** 连续贡献天数:以最近一次有贡献的日子收尾向前数——截止日没提交不打断,稀疏活跃下比"截至今天"更有信息量 */
  streak: number;
  /** 单日最高贡献数 */
  best: number;
  /** 有贡献的天数 */
  activeDays: number;
  /** 窗口内真实天数(不含首列对齐占位) */
  totalDays: number;
  /** 最近一次有贡献相对数据截止日:今天 / 昨天 / N 天前;无活跃记录为 '—' */
  lastActiveLabel: string;
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

/**
 * 拉取单仓库 star 数,三级兜底链(逐级尝试,全失败返回 null):
 * 1. 官方 REST——最准;但未认证限额 60 次/时/IP,大陆网络与共享出口经常 403
 * 2. shields.io JSON——CDN 重度缓存、可用性好;value 为字符串且 ≥1k 会缩写(如 '1.2k'),非纯数字视为失败
 * 3. ungh.cc 公共镜像——服务端 token 池偶发 429,作末位兜底
 */
export function parseStarsDirect(payload: unknown): number | null {
  const n = (payload as { stargazers_count?: unknown } | null)?.stargazers_count;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

export function parseStarsShields(payload: unknown): number | null {
  const v = (payload as { value?: unknown } | null)?.value;
  return typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : null;
}

export function parseStarsUngh(payload: unknown): number | null {
  const n = (payload as { repo?: { stars?: unknown } | null })?.repo?.stars;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

export async function fetchRepoStars(repo: string): Promise<number | null> {
  const attempt = async (
    url: string,
    parse: (payload: unknown) => number | null,
  ): Promise<number | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return parse(await res.json());
    } catch {
      return null;
    }
  };

  return (
    (await attempt(`https://api.github.com/repos/${repo}`, parseStarsDirect)) ??
    (await attempt(`https://img.shields.io/github/stars/${repo}.json`, parseStarsShields)) ??
    (await attempt(`https://ungh.cc/repos/${repo}`, parseStarsUngh))
  );
}
