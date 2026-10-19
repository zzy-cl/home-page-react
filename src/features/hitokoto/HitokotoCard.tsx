import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { quotes } from '@/content/quotes';
import { fetchHitokoto } from './api';

const FADE_MS = 160;

/**
 * 一言卡(设计稿交互):
 * 点击全卡换一条(quote-hit 覆盖层 + hover "↻ 换一条"提示);
 * 160ms opacity 淡出淡入(仅 opacity,动效红线内);
 * 实时 API 优先,失败时从内置语录池轮换(池末条即固定降级句)。
 */
export default function HitokotoCard() {
  // API 一言(成功时优先展示)
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['hitokoto'],
    queryFn: fetchHitokoto,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const [fallbackIdx, setFallbackIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const rotate = () => {
    setFading(true);
    setTimeout(() => {
      if (data) {
        // API 可用:再取一条
        void refetch();
      } else {
        // API 不可用:语录池轮换(避开当前条)
        setFallbackIdx((i) => {
          if (quotes.length < 2) return i;
          let next = i;
          while (next === i) next = Math.floor(Math.random() * quotes.length);
          return next;
        });
      }
      setFading(false);
    }, FADE_MS);
  };

  const quote = data ?? quotes[fallbackIdx];

  return (
    <>
      <figure
        className="quote-body"
        style={{ opacity: isFetching && !fading ? 0.4 : 1, transition: `opacity ${FADE_MS}ms` }}
      >
        <blockquote style={{ opacity: fading ? 0 : 1 }}>{quote?.text}</blockquote>
        <figcaption>{quote?.from ? `—— ${quote.from}` : ''}</figcaption>
      </figure>
      <button className="quote-hit" type="button" onClick={rotate} aria-label="换一条一言" />
      <span className="quote-more" aria-hidden="true">
        ↻ 换一条
      </span>
    </>
  );
}
