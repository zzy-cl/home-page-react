import { site } from '@/content/site';
import { deriveStats, toHeatmapLevels } from './model';
import type { ContributionYear } from './types';

/** GitHub mark(lucide 1.x 移除品牌图标后的内联替代,官方 octicon path);对齐由 .link-accent 的 flex 承担 */
function GithubMark({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/**
 * GitHub 热力图(设计稿视觉):
 * 53 列 × 7 行固定 11px 格子、l1-l4 accent 色阶、future 近透明格、少→多图例。
 * data 为 null → 灰色占位格 + 「—」占位数字(降级契约)。
 * 本组件只依赖展示模型(model.ts),不发请求;取数在 useGithubData.ts。
 */
export default function Heatmap({ data }: { data: ContributionYear | null }) {
  // 降级态显示占位符而非 0,避免"0 次贡献"被误读为真实数据
  const total = data?.total ?? null;

  // todayIndex:窗口最后一天的下标(其余为 future 近透明)
  const days =
    data?.days ?? Array.from({ length: 53 * 7 }, () => ({ date: '', count: 0, level: 0 as const }));
  const lastReal = days.reduce((acc, d, i) => (d.date ? i : acc), -1);
  // 有数据时按 count 映射等级;降级态全部渲染为普通空格(而非 future 近透明)
  const levels = data ? toHeatmapLevels(days, lastReal) : days.map(() => 0 as const);
  const stats = deriveStats(days);

  return (
    <>
      <header className="hm-head">
        <div className="hm-stat">
          <span className="card-kicker">GITHUB</span>
          <p className="hm-total">
            <strong className="hm-num mono">{total === null ? '—' : total.toLocaleString()}</strong>
            <span className="hm-unit">次贡献 / 年</span>
          </p>
        </div>
        <a className="hm-id mono" href={site.github} target="_blank" rel="noopener noreferrer">
          github.com/{site.githubUser}
        </a>
      </header>

      <div className="hm-scroll">
        <div
          className="hm-grid"
          role="img"
          aria-label={
            total === null
              ? 'GitHub 贡献数据暂不可用'
              : `过去一年的 GitHub 贡献热力图,共 ${total} 次贡献`
          }
        >
          {days.map((d, i) => {
            const lv = levels[i];
            const cls = lv === -1 ? 'hm-cell future' : lv > 0 ? `hm-cell l${lv}` : 'hm-cell';
            return (
              <i
                key={d.date || `pad-${i}`}
                className={cls}
                title={
                  d.date
                    ? d.count === 0
                      ? `${d.date} · 无贡献`
                      : `${d.date} · ${d.count} 次贡献`
                    : undefined
                }
                aria-hidden="true"
              />
            );
          })}
        </div>
      </div>

      {/* 衍生统计条:填充热力图与底栏之间的空档;数据降级时显示占位符 */}
      <dl className="hm-stats mono" aria-label="GitHub 贡献统计">
        <div className="hm-stat-item">
          <dt>连击</dt>
          <dd>{data ? `${stats.streak} 天` : '—'}</dd>
        </div>
        <div className="hm-stat-item">
          <dt>单日最高</dt>
          <dd>{data ? `${stats.best} 次` : '—'}</dd>
        </div>
        <div className="hm-stat-item">
          <dt>活跃天数</dt>
          <dd>{data ? `${stats.activeDays}/${stats.totalDays}` : '—'}</dd>
        </div>
        <div className="hm-stat-item">
          <dt>最近提交</dt>
          <dd>{data ? stats.lastActiveLabel : '—'}</dd>
        </div>
      </dl>

      <footer className="hm-foot">
        <a
          className="link-accent mono"
          href={site.github}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubMark size={12} />在 GitHub 上查看完整活跃记录
        </a>
        <span className="hm-legend" aria-hidden="true">
          <span className="mono">少</span>
          <i className="hm-cell" />
          <i className="hm-cell l1" />
          <i className="hm-cell l2" />
          <i className="hm-cell l3" />
          <i className="hm-cell l4" />
          <span className="mono">多</span>
        </span>
      </footer>
    </>
  );
}
