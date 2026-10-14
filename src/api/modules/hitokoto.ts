/**
 * 获取一言数据
 */
export interface HitokotoData {
  hitokoto: string
  from: string
}

export const getHitokoto = async (): Promise<HitokotoData> => {
  const res = await fetch('https://v1.hitokoto.cn')
  return await res.json()
}
