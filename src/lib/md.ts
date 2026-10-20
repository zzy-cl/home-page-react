/** /now 条目 */
export interface NowEntry {
  /** 文件名(去目录与 .md 后缀):列表渲染的稳定 key,同日多条目也不冲突 */
  slug: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  body: string;
}

/** 由 glob 模块路径取文件名作为 slug(:/src/content/now/2026-10-19-x.md → 2026-10-19-x) */
export function slugFromPath(path: string): string {
  const file = path.split('/').pop() ?? path;
  return file.replace(/\.md$/i, '');
}

/**
 * 解析 markdown frontmatter(自实现,不引 gray-matter —— spec Global Constraints)
 * 规则:trim 后以 `---\n` 开头才解析;逐行 `key: value`(首个冒号分割,值内冒号保留);
 * 遇闭合 `---` 停止;未闭合按无 frontmatter 处理。
 */
export function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const text = raw.trim();
  if (!text.startsWith('---')) {
    return { meta: {}, body: text };
  }

  const lines = text.split('\n');
  // 首行是 "---"
  const meta: Record<string, string> = {};
  let closed = false;
  let bodyStart = lines.length;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '---') {
      closed = true;
      bodyStart = i + 1;
      break;
    }
    const sep = line.indexOf(':');
    if (sep > 0) {
      meta[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
    }
  }

  if (!closed) {
    // 未闭合:按无 frontmatter 处理(Review Focus 4)
    return { meta: {}, body: text };
  }

  return { meta, body: lines.slice(bodyStart).join('\n').trim() };
}

/** 单篇 /now 条目解析:缺字段兜底空串,不抛错 */
export function parseNowEntry(raw: string, slug = ''): NowEntry {
  const { meta, body } = parseFrontmatter(raw);
  return {
    slug,
    date: meta.date ?? '',
    title: meta.title ?? '',
    body,
  };
}

/** 按 date 倒序(YYYY-MM-DD 字典序即时间序) */
export function sortNowEntries(entries: NowEntry[]): NowEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date));
}

/** 加载全部 /now 条目(vite 构建期收集,运行时零开销);slug 取自文件名 */
export function loadNowEntries(): NowEntry[] {
  const modules = import.meta.glob('@/content/now/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  return sortNowEntries(
    Object.entries(modules).map(([path, raw]) => parseNowEntry(raw, slugFromPath(path))),
  );
}
