/** /now 条目 */
export interface NowEntry {
  /** YYYY-MM-DD */
  date: string;
  title: string;
  body: string;
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
export function parseNowEntry(raw: string): NowEntry {
  const { meta, body } = parseFrontmatter(raw);
  return {
    date: meta.date ?? '',
    title: meta.title ?? '',
    body,
  };
}

/** 按 date 倒序(YYYY-MM-DD 字典序即时间序) */
export function sortNowEntries(entries: NowEntry[]): NowEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date));
}

/** 加载全部 /now 条目(vite 构建期收集,运行时零开销) */
export function loadNowEntries(): NowEntry[] {
  const modules = import.meta.glob('@/content/now/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  return sortNowEntries(Object.values(modules).map(parseNowEntry));
}
