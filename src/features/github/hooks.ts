import { useQuery } from '@tanstack/react-query';
import { site } from '@/content/site';
import { projects } from '@/content/projects.data';
import { fetchContributions, fetchRepoStars } from './api';

/** 一年贡献热力图数据;失败时 data 为 null → UI 渲染占位 */
export function useContributions() {
  return useQuery({
    queryKey: ['gh-contrib', site.githubUser],
    queryFn: () => fetchContributions(site.githubUser),
    staleTime: 60 * 60 * 1000, // 1h:无认证 60 req/h,主动限流
    retry: 1,
  });
}

/** 精选项目 star 数(逐仓库并行请求;无仓库的占位行跳过) */
export function useRepoStars() {
  const liveRepos = projects.filter((p): p is typeof p & { repo: string } => !!p.repo);
  return useQuery({
    queryKey: ['gh-stars', liveRepos.map((p) => p.repo)],
    queryFn: async () =>
      Promise.all(
        liveRepos.map(async (p) => ({
          repo: p.repo,
          stars: await fetchRepoStars(p.repo),
        })),
      ),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
}
