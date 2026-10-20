import { useQuery } from '@tanstack/react-query';
import { fetchHitokoto } from './api';

/**
 * 一言查询(staleTime 10min);失败静默降级,卡片用内置语录池兜底。
 * 与 github 的 useGithubData.ts 保持同一取数范式:query hook 独立成文件,
 * 组件里不再直接写 useQuery + fetch。
 */
export function useHitokoto() {
  return useQuery({
    queryKey: ['hitokoto'],
    queryFn: fetchHitokoto,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
