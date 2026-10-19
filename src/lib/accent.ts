/**
 * 强调色系统(设计稿 data-accent 方案):
 * 根元素挂 data-accent 属性,CSS 由 :root[data-accent="…"] 派生全部 rgba;
 * favicon 动态生成并随色切换;localStorage 键 md-accent 持久化。
 */

export const ACCENTS = {
  blue: { hex: '#7aa2ff', label: '静谧蓝' },
  orange: { hex: '#ff9e64', label: '暖橙' },
  violet: { hex: '#b47aff', label: '紫罗兰' },
} as const

export type AccentKey = keyof typeof ACCENTS

export function accentOrder(): AccentKey[] {
  return ['blue', 'orange', 'violet']
}

/** 轮换下一色;非法 key 回退 blue */
export function nextAccentKey(current: string): AccentKey {
  const order = accentOrder()
  const idx = order.indexOf(current as AccentKey)
  if (idx === -1) return 'blue'
  return order[(idx + 1) % order.length]
}

const ACCENT_KEY = 'md-accent'

/** 动态 favicon:终端方块 + 当前强调色(设计稿 app.js setFavicon) */
export function faviconDataUri(hex: string): string {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<rect width="64" height="64" rx="14" fill="#16181d"/>' +
    `<rect x="10" y="10" width="44" height="44" rx="10" fill="${hex}"/>` +
    '<path d="M20 24l10 8-10 8" fill="none" stroke="#0d0f12" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="34" y="38" width="14" height="5" rx="2.5" fill="#0d0f12"/></svg>'
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function safeGet(): string | null {
  try {
    return localStorage.getItem(ACCENT_KEY)
  } catch {
    return null
  }
}

function safeSet(key: string): void {
  try {
    localStorage.setItem(ACCENT_KEY, key)
  } catch {
    // 隐私模式等场景忽略持久化
  }
}

function applyDom(key: string, hex: string): void {
  try {
    document.documentElement.setAttribute('data-accent', key)
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (link) link.href = faviconDataUri(hex)
  } catch {
    // 无 DOM(测试/SSR)环境跳过
  }
}

/** 应用强调色;announce=true 时返回给人读的确认文案 */
export function applyAccent(key: string, announce = false): string | null {
  const conf = ACCENTS[key as AccentKey] ?? ACCENTS.blue
  const finalKey = ACCENTS[key as AccentKey] ? key : 'blue'
  safeSet(finalKey)
  applyDom(finalKey, conf.hex)
  return announce ? `强调色已切换 → ${conf.label} ${conf.hex}` : null
}

/** 启动恢复:读持久化 key 并应用,返回生效 key(main.tsx 调用一次) */
export function restoreAccent(): AccentKey {
  const saved = safeGet()
  const key: AccentKey =
    saved && ACCENTS[saved as AccentKey] ? (saved as AccentKey) : 'blue'
  applyDom(key, ACCENTS[key].hex)
  return key
}
