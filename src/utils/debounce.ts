// 防抖函数
// 原实现把 timeout 存在模块级变量上，所有调用共享一个计时器且无法拿到返回的
// 防抖函数，等于完全失效；这里改为标准闭包实现，每次 debounce 返回独立函数。
/**
 * @param func - 需要防抖的函数
 * @param wait - 等待时间（毫秒），默认 300ms
 */
function debounce<T extends (...args: never[]) => void>(func: T, wait = 300) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      timeout = null
      func(...args)
    }, wait)
  }
}

export default debounce
