import { Link } from '@tanstack/react-router';
import BentoCard from '@/components/BentoCard';
import { site } from '@/content/site';
import { projects } from '@/content/projects.data';
import { usesSections } from '@/content/uses';
import Heatmap from '@/features/github/Heatmap';
import { useContributions, useRepoStars } from '@/features/github/useGithubData';
import HitokotoCard from '@/features/hitokoto/HitokotoCard';
import { loadNowEntries } from '@/lib/md';
import { useUiStore } from '@/store/ui';

/*
 * 首页(设计稿 index.html 1:1):
 * 行1-2: HERO 4(row2) | GITHUB 热力图 8(row2)
 * 行3:   PROJECTS 4 | NOW 3 | USES 3 | 一言 2
 */
function Home() {
  const nowEntries = loadNowEntries();
  const latest = nowEntries[0];
  const { data: contributions } = useContributions();
  const { data: stars } = useRepoStars();
  const starsByRepo = new Map(
    (stars ?? []).filter((s) => s.stars !== null).map((s) => [s.repo, s.stars]),
  );
  const openPalette = () => useUiStore.getState().setCommandOpen(true);

  const nowSummary = latest
    ? latest.body.length > 96
      ? `${latest.body.slice(0, 96)}…`
      : latest.body
    : null;
  const usesPreview = usesSections
    .flatMap((s) => s.items.slice(0, 1).map((i) => i.name))
    .slice(0, 3);

  return (
    <main className="page page-home">
      <div className="bento">
        {/* ① HERO */}
        <BentoCard variant="hero" index={0} label="站长信息">
          <div style={{ display: 'grid', gap: 8 }}>
            <h1 className="hero-title">{site.name}</h1>
            <p className="hero-sub">{site.tagline}</p>
            <dl className="hero-facts mono">
              {site.facts.map((f) => (
                <div key={f.label} className="hero-fact">
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ul className="tag-row" aria-label="技术关键词">
            {site.keywords.map((k) => (
              <li key={k} className="pill">
                {k}
              </li>
            ))}
          </ul>
          {/* 点击呼出面板:移动端无键盘,这是面板与终端的唯一入口 */}
          <button
            className="kbd-hint"
            type="button"
            onClick={openPalette}
            aria-label="打开全站指令面板(Ctrl+K)"
          >
            <kbd>Ctrl</kbd>
            <kbd>K</kbd>
            <span>全站指令</span>
            <span className="chev mono" aria-hidden="true">
              ▸
            </span>
          </button>
        </BentoCard>

        {/* ② GITHUB 热力图 */}
        <BentoCard variant="heatmap" index={1} label="GitHub 活跃概览">
          <Heatmap data={contributions ?? null} />
        </BentoCard>

        {/* ③ PROJECTS */}
        <BentoCard variant="projects" index={2} kicker="PROJECTS" label="精选项目">
          <ul className="proj-list" aria-label="精选项目列表">
            {projects.map((p) => {
              const stars = p.repo ? starsByRepo.get(p.repo) : undefined;
              const inner = (
                <>
                  <span className="proj-main">
                    <span className="proj-name">{p.name}</span>
                    <span className="proj-desc">{p.desc}</span>
                  </span>
                  <span className="proj-stars">
                    <span className="star" aria-hidden="true">
                      ★
                    </span>
                    {stars ?? '--'}
                  </span>
                </>
              );
              return (
                // repo 为 null 的占位项目不止一个,以 name 兜底保证 key 唯一
                <li key={p.repo ?? p.name}>
                  {p.repo ? (
                    <a
                      className="proj-row"
                      href={`https://github.com/${p.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="proj-row">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </BentoCard>

        {/* ④ NOW */}
        <BentoCard variant="now" index={3} kicker="NOW" label="近况摘要">
          <p className="card-body">{nowSummary ?? '暂无近况'}</p>
          <Link className="more" to="/now">
            查看全部 →
          </Link>
        </BentoCard>

        {/* ⑤ USES */}
        <BentoCard variant="uses" index={4} kicker="USES" label="装备摘要">
          <ul className="tag-row" aria-label="常用装备">
            {usesPreview.map((name) => (
              <li key={name} className="pill">
                {name}
              </li>
            ))}
          </ul>
          <Link className="more" to="/uses">
            查看全部 →
          </Link>
        </BentoCard>

        {/* ⑥ 一言 */}
        <BentoCard variant="quote" index={5} kicker="一言" label="一言">
          <HitokotoCard />
        </BentoCard>
      </div>
    </main>
  );
}

export default Home;
