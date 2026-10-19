import { Link } from '@tanstack/react-router';
import { useUiStore } from '@/store/ui';
import { site } from '@/content/site';
import { loadNowEntries } from '@/lib/md';

/** /now(设计稿 now.html):返回头 + 页头 + 倒序条目卡 + 空状态 */
function Now() {
  const openPalette = () => useUiStore.getState().setCommandOpen(true);
  const entries = loadNowEntries();

  return (
    <main className="page page-doc">
      <header className="doc-top">
        <Link className="back-link mono" to="/">
          ← {site.name}
        </Link>
        <button
          className="kbd-hint kbd-hint--sm"
          type="button"
          onClick={openPalette}
          aria-label="打开全站指令面板(Ctrl+K)"
        >
          <kbd>Ctrl</kbd>
          <kbd>K</kbd>
        </button>
      </header>

      <header className="doc-head">
        <h1>Now</h1>
        <p className="doc-sub">最近在折腾什么</p>
      </header>

      <div className="doc">
        {entries.length === 0 ? (
          <section className="card card--doc empty-state">
            <p className="empty-title">暂无近况</p>
            <p className="empty-sub">工作台暂时干净,去写点代码再来。</p>
          </section>
        ) : (
          entries.map((entry, i) => (
            <article
              key={`${entry.date}-${i}`}
              className="card card--doc entry"
              style={{ '--i': i } as React.CSSProperties}
            >
              <time className="entry-date mono" dateTime={entry.date || undefined}>
                {entry.date}
              </time>
              {entry.title && <h2 className="entry-title">{entry.title}</h2>}
              <div className="entry-body">
                {entry.body
                  .split(/\n{2,}/)
                  .filter((p) => p.trim())
                  .map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}

export default Now;
