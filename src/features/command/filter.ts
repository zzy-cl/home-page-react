import type { Command } from '@/lib/command';

/**
 * 命令过滤:query trim 后小写;空串返回全部;
 * title 或任一 keyword includes 命中。
 *
 * 用泛型保留入参的子类型(T extends Command → T[]),调用方不再需要
 * `as UiCommand[]` 这类双重断言;command 面板的展示字段因此不会在这里丢失。
 */
export function filterCommands<T extends Command>(cmds: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return cmds;
  return cmds.filter(
    (c) => c.title.toLowerCase().includes(q) || c.keywords.some((k) => k.toLowerCase().includes(q)),
  );
}
