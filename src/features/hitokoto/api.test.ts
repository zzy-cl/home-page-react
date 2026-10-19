import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchHitokoto } from './api';

describe('fetchHitokoto', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('成功解析 hitokoto/from', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ hitokoto: '写代码如写诗', from: '站长' }),
      }),
    );
    await expect(fetchHitokoto()).resolves.toEqual({ text: '写代码如写诗', from: '站长' });
  });

  it('fetch reject 返回 null 而不 throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    await expect(fetchHitokoto()).resolves.toBeNull();
  });

  it('HTTP 非 2xx 返回 null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(fetchHitokoto()).resolves.toBeNull();
  });
});
