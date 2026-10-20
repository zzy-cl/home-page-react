import { fetchParsed } from '@/lib/http';

export interface Hitokoto {
  text: string;
  from: string;
}

/** 解析一言响应;载荷不含可用文案时返回 null(降级交给 lib/http 统一处理) */
function parseHitokoto(payload: unknown): Hitokoto | null {
  const data = payload as { hitokoto?: unknown; from?: unknown } | null;
  if (!data || typeof data.hitokoto !== 'string' || !data.hitokoto) return null;
  return { text: data.hitokoto, from: typeof data.from === 'string' ? data.from : '' };
}

/** 拉取一言(v1.hitokoto.cn);任何失败返回 null,不 throw(降级契约) */
export function fetchHitokoto(): Promise<Hitokoto | null> {
  // c=a 动画 c=b 文学 c=k 哲学 c=i 诗词
  return fetchParsed('https://v1.hitokoto.cn/?c=a&c=b&c=k&c=i', parseHitokoto);
}
