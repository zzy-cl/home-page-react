import { Link } from '@tanstack/react-router';
import { useUiStore } from '@/store/ui';
import { site } from '@/content/site';
import { useSections } from '@/content/uses';

/** /uses(设计稿 uses.html):返回头 + 页头 + 分区卡,item 两栏结构 */
function Uses() {
  const openPalette = () => useUiStore.getState().setCommandOpen(true);
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
        <h1>Uses</h1>
        <p className="doc-sub">装备与技术栈,以及每一样东西的使用语境</p>
      </header>

      <div className="doc">
        {useSections.map((section, i) => (
          <section
            key={section.title}
            className="card card--doc"
            style={{ '--i': i } as React.CSSProperties}
            aria-label={section.title}
          >
            <h2 className="doc-sec">{section.title}</h2>
            <ul className="item-list">
              {section.items.map((item) => (
                <li key={item.name} className="item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-ctx">{item.note}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

export default Uses;
