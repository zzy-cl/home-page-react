/** 单日贡献(热力图一格) */
export interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

/** 一年贡献 */
export interface ContributionYear {
  total: number
  days: ContributionDay[]
}

/**
 * 解析 github-contributions-api.jogruber.de v4 响应:
 * { total: Record<string, number>; contributions: Array<{ date, count, level }> }
 * spec 修正:GitHub 官方无公开 REST 热力图接口,该社区服务为无 key 事实标准。
 */
export function parseContributions(payload: unknown): ContributionYear {
  const p = payload as {
    total?: Record<string, number>
    contributions?: Array<{ date?: unknown; count?: unknown; level?: unknown }>
  }

  if (!p || typeof p !== 'object' || !Array.isArray(p.contributions)) {
    throw new Error('invalid contributions payload')
  }

  const days: ContributionDay[] = p.contributions.map((c) => ({
    date: String(c.date ?? ''),
    count: Number(c.count ?? 0) || 0,
    // level 夹取到 0-4(jogruber 本就 0-4,防御性处理)
    level: Math.min(4, Math.max(0, Math.floor(Number(c.level ?? 0) || 0))) as 0 | 1 | 2 | 3 | 4,
  }))

  const total = p.total
    ? Object.values(p.total).reduce((sum, n) => sum + (Number(n) || 0), 0)
    : days.reduce((sum, d) => sum + d.count, 0)

  return { total, days }
}

/** 拉取一年贡献;任何失败返回 null,不 throw(降级契约,Review Focus 1) */
export async function fetchContributions(user: string): Promise<ContributionYear | null> {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${user}`)
    if (!res.ok) return null
    return parseContributions(await res.json())
  } catch {
    return null
  }
}

/** 拉取单仓库 star 数(官方 REST,无认证);失败返回 null */
export async function fetchRepoStars(repo: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`)
    if (!res.ok) return null
    const data = (await res.json()) as { stargazers_count?: unknown }
    const n = Number(data.stargazers_count)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}
