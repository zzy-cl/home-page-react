import { useQuery } from '@tanstack/react-query'
import { fetchHitokoto } from './api'

const FALLBACK = '保持热爱,保持构建'

/**
 * 一言卡:点击换一条。
 * 降级契约(Review Focus 2):接口失败显示固定语句,不弹错。
 */
export default function HitokotoCard() {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['hitokoto'],
    queryFn: fetchHitokoto,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })

  return (
    <button
      type="button"
      onClick={() => refetch()}
      className="w-full cursor-pointer text-left"
      title="点我换一条"
    >
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-0)' }}>
        {isFetching ? '……' : (data?.text ?? FALLBACK)}
      </p>
      {data?.from && (
        <p className="mt-2 text-xs" style={{ color: 'var(--text-2)' }}>
          —— {data.from}
        </p>
      )}
    </button>
  )
}
