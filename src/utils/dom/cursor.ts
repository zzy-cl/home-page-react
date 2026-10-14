// 原实现依赖 lodash-es 的 isEqual 仅为比较两个 {x,y} 坐标，
// 这里用简单的字段比较替代，去掉该依赖。

interface CursorPos {
  x: number
  y: number
}

let mainCursor: Cursor | null = null

const lerp = (a: number, b: number, n: number) => {
  if (Math.round(a) === b) {
    return b
  }
  return (1 - n) * a + n * b
}

const isMobileOrTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 720
}

const cursorInit = () => {
  if (isMobileOrTouchDevice()) {
    return null
  }

  mainCursor = new Cursor()
  return mainCursor
}

class Cursor {
  pos: { curr: CursorPos | null; prev: CursorPos | null } = { curr: null, prev: null }
  cursor!: HTMLDivElement
  scr!: HTMLStyleElement
  // 跟踪当前的缩放状态,用于在移动时保持缩放效果
  currentScale: number = 1

  // 使用 CSS Transform 替代 left/top,避免触发 Layout 重排
  // Transform 只触发 Composite 层,性能更好,减少控制台卡顿
  // 使用 translate3d 开启硬件加速
  move(left: number, top: number) {
    // translate3d 比 translate 性能更好,会强制启用 GPU 加速
    this.cursor.style.transform = `translate3d(${left}px, ${top}px, 0) scale(${this.currentScale})`
  }

  create() {
    if (!this.cursor) {
      this.cursor = document.createElement('div')
      this.cursor.id = 'cursor'
      this.cursor.classList.add('xs-hidden')
      this.cursor.classList.add('g-hidden')
      document.body.append(this.cursor)
    }

    // 原版在此遍历 DOM 收集 cursor:pointer 元素（pt 数组），未参与渲染，已省略

    document.body.appendChild((this.scr = document.createElement('style')))
    this.scr.innerHTML = `* {cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='10px' height='10px'><circle cx='4' cy='4' r='4' fill='white' /></svg>") 4 4, auto !important}`
  }

  refresh() {
    this.scr.remove()
    this.cursor.classList.remove('active')
    this.pos = { curr: null, prev: null }

    this.create()
    this.init()
    this.render()
  }

  init() {
    document.onmousemove = (e) => {
      if (this.pos.curr == null) this.move(e.clientX - 8, e.clientY - 8)
      this.pos.curr = {
        x: e.clientX - 8,
        y: e.clientY - 8,
      }
      this.cursor.classList.remove('g-hidden')
      this.render()
    }
    document.onmouseenter = () => {
      this.cursor.classList.remove('g-hidden')
      this.currentScale = 1
      // 更新 transform 以应用新的 scale
      if (this.pos.prev) this.move(this.pos.prev.x, this.pos.prev.y)
    }
    document.onmouseleave = () => {
      this.cursor.classList.add('g-hidden')
      this.currentScale = 0.5
      // 更新 transform 以应用新的 scale
      if (this.pos.prev) this.move(this.pos.prev.x, this.pos.prev.y)
    }
    document.onmousedown = () => {
      this.cursor.classList.add('active')
      this.currentScale = 1.5
      // 更新 transform 以应用新的 scale
      if (this.pos.prev) this.move(this.pos.prev.x, this.pos.prev.y)
    }
    document.onmouseup = () => {
      this.cursor.classList.remove('active')
      this.currentScale = 1
      // 更新 transform 以应用新的 scale
      if (this.pos.prev) this.move(this.pos.prev.x, this.pos.prev.y)
    }
  }

  render() {
    if (this.pos.prev && this.pos.curr) {
      this.pos.prev.x = lerp(this.pos.prev.x, this.pos.curr.x, 0.35)
      this.pos.prev.y = lerp(this.pos.prev.y, this.pos.curr.y, 0.35)
      this.move(this.pos.prev.x, this.pos.prev.y)
    } else if (this.pos.curr) {
      this.pos.prev = { ...this.pos.curr }
    }
    if (
      this.pos.curr &&
      this.pos.prev &&
      (this.pos.curr.x !== this.pos.prev.x || this.pos.curr.y !== this.pos.prev.y)
    ) {
      requestAnimationFrame(() => this.render())
    }
  }
}

export default cursorInit
