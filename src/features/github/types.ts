/** 单日贡献(热力图一格);date 为空串表示对齐占位格 */
export interface ContributionDay {
  date: string;
  count: number;
  /** 上游 GitHub 等级(0-4);渲染以 count 重新映射(见 model.ts),此字段为镜像保留 */
  level: 0 | 1 | 2 | 3 | 4;
}

/** 一年贡献(热力图窗口) */
export interface ContributionYear {
  total: number;
  days: ContributionDay[];
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
