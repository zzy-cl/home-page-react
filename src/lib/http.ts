/**
 * 外部数据统一出口(降级契约的唯一实现点)。
 *
 * 站点对外部服务的约定(spec §6.3):任何失败一律静默降级为 null,
 * 由 UI 渲染占位符,不弹错、不抛错。此前该契约在每个 api 模块里手写,
 * 新增数据源就要复刻一遍,且没有超时保护。现在收敛到这里:
 * - 8s 超时,用 AbortController 主动中断悬挂请求;
 * - 非 2xx / 网络异常 / JSON 解析异常 / parse 抛错,统一返回 null;
 * - 不负责重试,重试策略由 TanStack Query 的 retry 控制。
 */

/** 默认超时:外部 API 超过 8s 视为不可用 */
export const DEFAULT_TIMEOUT_MS = 8000;

/**
 * 拉取 JSON 并交给 parse 转换;任何环节失败返回 null。
 * parse 返回 null 表示载荷不合法,同样视为失败。
 */
export async function fetchParsed<T>(
  url: string,
  parse: (payload: unknown) => T | null,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return parse(await res.json());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
