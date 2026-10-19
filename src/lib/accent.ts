/** accent 轮换顺序(spec §5.1) */
export const ACCENTS = ['#7aa2ff', '#ff9e64', '#b47aff'] as const

const ACCENT_KEY = 'accent'

/** 立即应用强调色到根元素并持久化;无 DOM/存储环境(测试/SSR)安全 */
export function applyAccent(color: string): void {
  try {
    document.documentElement.style.setProperty('--accent', color)
  } catch {
    // 无 document(纯 node 环境)则跳过 DOM 写入
  }
  try {
    localStorage.setItem(ACCENT_KEY, color)
  } catch {
    // localStorage 不可用(隐私模式)则不持久化,主题仅本次会话生效
  }
}

/** 恢复持久化的强调色;无存储返回默认值。main.tsx 启动时调用一次 */
export function restoreAccent(): string {
  let saved: string | null = null
  try {
    saved = localStorage.getItem(ACCENT_KEY)
  } catch {
    saved = null
  }
  const color = saved ?? ACCENTS[0]
  applyAccentSilently(color)
  return color
}

function applyAccentSilently(color: string): void {
  try {
    document.documentElement.style.setProperty('--accent', color)
  } catch {
    // 无 document 环境跳过
  }
}
