export interface Hitokoto {
  text: string
  from: string
}

/** 拉取一言(v1.hitokoto.cn);任何失败返回 null,不 throw(降级契约,Review Focus 2) */
export async function fetchHitokoto(): Promise<Hitokoto | null> {
  try {
    // c=a 动画 c=b 文学 c=k 哲学 c=i 诗词
    const res = await fetch('https://v1.hitokoto.cn/?c=a&c=b&c=k&c=i')
    if (!res.ok) return null
    const data = (await res.json()) as { hitokoto?: unknown; from?: unknown }
    const text = typeof data.hitokoto === 'string' ? data.hitokoto : ''
    if (!text) return null
    return { text, from: typeof data.from === 'string' ? data.from : '' }
  } catch {
    return null
  }
}
