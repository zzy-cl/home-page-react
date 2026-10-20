/**
 * hitokoto feature 的 public 出口:消费方(command 面板的"换一条")只依赖这里。
 * HitokotoCard 组件按路径由页面导入,避免 barrel 把组件带进无谓的 chunk。
 */
export { fetchHitokoto } from './api';
export type { Hitokoto } from './api';
export { useHitokoto } from './useHitokoto';
