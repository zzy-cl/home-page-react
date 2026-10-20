import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchParsed } from './http';

const okJson = (body: unknown) => ({ ok: true, json: async () => body });

describe('fetchParsed(降级契约的唯一实现)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('2xx + parse 成功返回转换值', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okJson({ n: 7 })));
    await expect(fetchParsed('https://x', (p) => (p as { n: number }).n)).resolves.toBe(7);
  });

  it('非 2xx 返回 null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(fetchParsed('https://x', () => 1)).resolves.toBeNull();
  });

  it('网络异常返回 null 而不抛错', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    await expect(fetchParsed('https://x', () => 1)).resolves.toBeNull();
  });

  it('parse 抛错(载荷非法)返回 null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okJson({})));
    await expect(
      fetchParsed('https://x', () => {
        throw new Error('invalid payload');
      }),
    ).resolves.toBeNull();
  });

  it('parse 返回 null 视为失败', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okJson({})));
    await expect(fetchParsed('https://x', () => null)).resolves.toBeNull();
  });

  it('超时主动 abort 并返回 null', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: { signal?: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
          }),
      ),
    );

    const pending = fetchParsed('https://x', () => 1, 50);
    await vi.advanceTimersByTimeAsync(51);
    await expect(pending).resolves.toBeNull();
  });

  it('请求结束后清理定时器,不留悬挂计时器', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okJson({ n: 1 })));
    await expect(fetchParsed('https://x', () => 1, 50)).resolves.toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
