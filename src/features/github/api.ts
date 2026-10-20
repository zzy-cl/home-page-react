import { fetchParsed } from '@/lib/http';
import type { ContributionDay, ContributionYear } from './types';

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

/** 拉取一年贡献;任何失败返回 null,不 throw(降级契约由 lib/http 统一实现) */
export function fetchContributions(user: string): Promise<ContributionYear | null> {
  return fetchParsed(`https://github-contributions-api.jogruber.de/v4/${user}`, parseContributions);
}

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

/**
 * 拉取单仓库 star 数,三级兜底链(逐级尝试,全失败返回 null):
 * 1. 官方 REST——最准;但未认证限额 60 次/时/IP,大陆网络与共享出口经常 403
 * 2. shields.io JSON——CDN 重度缓存、可用性好;value 为字符串且 ≥1k 会缩写(如 '1.2k'),非纯数字视为失败
 * 3. ungh.cc 公共镜像——服务端 token 池偶发 429,作末位兜底
 */
export async function fetchRepoStars(repo: string): Promise<number | null> {
  return (
    (await fetchParsed(`https://api.github.com/repos/${repo}`, parseStarsDirect)) ??
    (await fetchParsed(`https://img.shields.io/github/stars/${repo}.json`, parseStarsShields)) ??
    (await fetchParsed(`https://ungh.cc/repos/${repo}`, parseStarsUngh))
  );
}
