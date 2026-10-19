export interface Command {
  id: string
  title: string
  keywords: string[]
  section: '导航' | '链接' | '主题' | '趣项'
  action: () => void
}

/**
 * 命令过滤:query trim 后小写;空串返回全部;
 * title 或任一 keyword includes 命中。
 */
export function filterCommands(cmds: Command[], query: string): Command[] {
  const q = query.trim().toLowerCase()
  if (!q) return cmds
  return cmds.filter(
    (c) => c.title.toLowerCase().includes(q) || c.keywords.some((k) => k.toLowerCase().includes(q)),
  )
}
