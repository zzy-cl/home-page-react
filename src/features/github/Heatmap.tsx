import { site } from '@/content/site';
import { toHeatmapLevels } from './api';
import type { ContributionYear } from './api';

/** GitHub mark(lucide 1.x 移除品牌图标后的内联替代,官方 octicon path) */
function GithubMark({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      style={{ verticalAlign: '-2px', marginRight: 4 }}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/**
 * GitHub 热力图(设计稿视觉):
 * 53 列 × 7 行固定 11px 格子、l1-l4 accent 色阶、future 近透明格、少→多图例。
 * data 为 null → 全灰占位(降级契约,Review Focus 1)。
 */
export default function Heatmap({ data }: { data: ContributionYear | null }) {
  const total = data?.total ?? 0;

  // todayIndex:窗口最后一天的下标(其余为 future 近透明)
  const days =
    data?.days ?? Array.from({ length: 53 * 7 }, () => ({ date: '', count: 0, level: 0 as const }));
  const lastReal = days.reduce((acc, d, i) => (d.date ? i : acc), -1);
  const levels = toHeatmapLevels(days, lastReal);

  return (
    <>
      <header className="hm-head">
        <div className="hm-stat">
          <span className="card-kicker">GITHUB</span>
          <p className="hm-total">
            <strong className="hm-num mono">{total.toLocaleString()}</strong>
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
          aria-label={`过去一年的 GitHub 贡献热力图,共 ${total} 次贡献`}
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
