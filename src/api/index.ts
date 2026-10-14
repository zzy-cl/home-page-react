// API 统一导出入口

// 音乐相关API
import { getPlayerList } from './modules/music'

// 一言相关API
import { getHitokoto } from './modules/hitokoto'

// 天气相关API
import { getAdcode, getWeather, getOtherWeather } from './modules/weather'

export { getPlayerList, getHitokoto, getAdcode, getWeather, getOtherWeather }
export type { PlayerAudio } from './modules/music'
export type { HitokotoData } from './modules/hitokoto'
