import { describe, expect, it } from 'vitest';
import {
  loadNowEntries,
  parseFrontmatter,
  parseNowEntry,
  slugFromPath,
  sortNowEntries,
} from './md';

describe('parseFrontmatter', () => {
  it('解析标准 frontmatter', () => {
    const { meta, body } = parseFrontmatter('---\ntitle: 你好\ndate: 2026-10-19\n---\n正文');
    expect(meta).toEqual({ title: '你好', date: '2026-10-19' });
    expect(body).toBe('正文');
  });

  it('无 frontmatter 时 meta 为空、body 为全文', () => {
    const { meta, body } = parseFrontmatter('只有正文');
    expect(meta).toEqual({});
    expect(body).toBe('只有正文');
  });

  it('frontmatter 未闭合时按无 frontmatter 处理', () => {
    const { meta } = parseFrontmatter('---\ntitle: 未闭合');
    expect(meta).toEqual({});
  });

  it('值中的冒号不破坏解析', () => {
    const { meta } = parseFrontmatter('---\ntitle: a: b\n---\nx');
    expect(meta.title).toBe('a: b');
  });
});

describe('parseNowEntry 容错', () => {
  it('缺 title 兜底空串,不抛错', () => {
    const e = parseNowEntry('---\ndate: 2026-10-19\n---\n正文');
    expect(e.title).toBe('');
    expect(e.body).toBe('正文');
  });

  it('缺 date 兜底空串', () => {
    expect(parseNowEntry('---\ntitle: t\n---\nb').date).toBe('');
  });

  it('slug 由调用方传入,缺失时兜底空串', () => {
    expect(parseNowEntry('a').slug).toBe('');
    expect(parseNowEntry('a', '2026-10-19-hello').slug).toBe('2026-10-19-hello');
  });
});

describe('slugFromPath', () => {
  it('取文件名并去掉 .md 后缀', () => {
    expect(slugFromPath('/src/content/now/2026-10-19-hello-monologue-deck.md')).toBe(
      '2026-10-19-hello-monologue-deck',
    );
  });

  it('大小写后缀与无目录路径同样处理', () => {
    expect(slugFromPath('note.MD')).toBe('note');
    expect(slugFromPath('note')).toBe('note');
  });
});

describe('loadNowEntries(构建期 glob 收集)', () => {
  it('每个条目的 slug 非空且唯一(列表 key 的稳定性来源)', () => {
    const entries = loadNowEntries();
    expect(entries.length).toBeGreaterThan(0);
    const slugs = entries.map((e) => e.slug);
    expect(slugs.every((s) => s.length > 0)).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('按 date 倒序返回', () => {
    const dates = loadNowEntries().map((e) => e.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});

describe('sortNowEntries', () => {
  it('按 date 倒序', () => {
    const sorted = sortNowEntries([
      { slug: 'a', date: '2026-01-01', title: 'a', body: '' },
      { slug: 'b', date: '2026-10-01', title: 'b', body: '' },
    ]);
    expect(sorted[0].title).toBe('b');
  });
});
