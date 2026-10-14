# React 主页项目渐进式现代化设计文档

> **设计日期**: 2026-10-14  
> **设计者**: Claude (Opus 5.5)  
> **基线版本**: commit `811532f`  
> **重构策略**: 在主分支增量式重构,保持项目持续可运行

---

## 一、项目现状分析

### 1.1 技术栈
- **框架**: React 19.2.8 + TypeScript 6.0.2
- **构建工具**: Vite 8.3.0
- **状态管理**: Zustand 5.0.15
- **数据获取**: @tanstack/react-query 5.104.2
- **UI 库**: Antd 6.6.6 + Tailwind CSS 4.3.3
- **编译优化**: 已启用 React Compiler (babel-plugin-react-compiler)
- **PWA**: vite-plugin-pwa 2.0.0

### 1.2 当前问题清单

#### 性能问题 (P0 - 立即解决)
1. **Bundle 过大**: 795 KB 单文件,无代码分割
2. **字体文件巨大**: SmileySans-Oblique.woff2 (1.36 MB)
3. **持续 RAF 渲染**: 光标动画即使静止也在运行
4. **图片未优化**: 无懒加载、无现代格式

#### 架构问题 (P1 - 第二阶段)
5. **状态管理混乱**: 49 个字段的单一巨型 store
6. **直接操作 store**: 绕过 React 响应式的 `getState()` / `setState()`
7. **组件职责不清**: App.tsx 承担过多职责
8. **API 层过薄**: 缺乏统一错误处理和重试逻辑

#### React 实践问题 (P1 - 第二阶段)
9. **DOM 直接操作**: Player 组件 `querySelector` 获取歌词
10. **第三方库不兼容**: APlayer (jQuery 时代) 与 React 理念冲突
11. **副作用管理混乱**: useEffect 外修改 store
12. **事件监听器管理不当**: 存在泄漏风险

#### 体验问题 (P2 - 第三阶段)
13. **禁用右键**: 违背 Web 开放精神
14. **加载体验差**: 无骨架屏,白屏时间长
15. **可访问性不足**: 缺少 ARIA、键盘导航不完整

### 1.3 性能基线 (待测量)
```
当前构建产物:
- 主 JS bundle: 795 KB (gzip: 252 KB)
- 主 CSS bundle: 61 KB (gzip: 11.7 KB)
- 字体总大小: ~1.5 MB
- 总体积: ~2.4 MB

目标:
- 主 JS bundle: < 150 KB (初始) + 按需加载
- 主 CSS bundle: < 30 KB
- 字体总大小: < 200 KB
- 总体积: < 600 KB
- Lighthouse Performance: > 90 分
```

---

## 二、架构设计

### 2.1 整体架构演进路线

```
阶段一: 性能优化 (保持现有架构)
├── 代码分割
├── 资源优化
├── 渲染优化
└── 构建优化

阶段二: 架构重构 (改善代码质量)
├── 状态管理重构
├── API 层增强
├── 组件拆分
└── 播放器替换

阶段三: React 19 现代化 (充分利用新特性)
├── Suspense + Transition
├── use() hook
├── Server Components 探索
└── 动画系统升级
```

### 2.2 目录结构演进

**当前结构**:
```
src/
├── api/              # API 调用
├── assets/           # 静态资源
├── components/       # 组件 (扁平)
├── store/            # Zustand store
├── style/            # 全局样式
├── types/            # 类型定义
├── utils/            # 工具函数
└── views/            # 页面组件
```

**目标结构 (Feature-Sliced Design 简化版)**:
```
src/
├── features/         # 业务功能模块
│   ├── player/       # 播放器功能
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── types/
│   ├── weather/      # 天气功能
│   ├── hitokoto/     # 一言功能
│   └── wallpaper/    # 壁纸功能
├── shared/           # 共享代码
│   ├── api/          # 通用 API 客户端
│   ├── components/   # 通用 UI 组件
│   ├── hooks/        # 通用 hooks
│   ├── lib/          # 第三方库封装
│   └── utils/        # 工具函数
├── app/              # 应用入口
│   ├── providers/    # Context Providers
│   ├── routes/       # 路由 (如需)
│   └── App.tsx
└── pages/            # 页面级组件
```

### 2.3 状态管理重构设计

**现状**: 单一 49 字段巨型 store

**目标**: 按功能域拆分

```typescript
// 新架构
features/
├── player/store/usePlayerStore.ts     # 播放器状态
├── weather/store/useWeatherStore.ts   # 天气状态
├── wallpaper/store/useWallpaperStore.ts # 壁纸状态
└── ui/store/useUIStore.ts             # UI 交互状态

// 持久化策略
- 用户偏好 → localStorage (settings)
- 运行时状态 → 内存 (不持久化)
- 服务端数据 → React Query 管理
```

### 2.4 数据流架构

```
用户交互
  ↓
组件 (UI)
  ↓
Zustand Actions (同步状态)
  ↓
React Query Mutations (异步操作)
  ↓
API 层 (统一错误处理)
  ↓
后端服务
  ↓
React Query Cache (自动缓存)
  ↓
组件 (重新渲染)
```

---

## 三、分阶段实施计划

### 阶段一: 性能优化 (1 周) 🎯

**目标**: Bundle 体积减少 60%,Lighthouse 性能分数 > 85

#### 任务 1.1: 代码分割 (优先级: P0)
```typescript
// 1. 路由懒加载 (虽然是单页,但部分重模块可按需加载)
const Player = lazy(() => import('@/components/Player'))
const Settings = lazy(() => import('@/views/MoreSettings'))
const Box = lazy(() => import('@/views/Box'))

// 2. 第三方库按需加载
// - APlayer: 只在点击音乐按钮时加载
// - Antd: 按需导入,tree-shaking
// - @icon-park/react: 按需导入

// 3. 动态导入配置
import('aplayer').then(({ default: APlayer }) => {
  // 初始化播放器
})
```

**预期收益**: JS bundle 从 795 KB → ~200 KB (初始加载)

#### 任务 1.2: 字体优化 (优先级: P0)
```bash
# 1. 中文字体子集化
# SmileySans-Oblique.woff2 (1.36 MB) → 仅保留常用汉字 (~150 KB)
# 工具: fontmin / fonttools

# 2. 字体加载策略
font-display: swap;  # 避免 FOIT (Flash of Invisible Text)

# 3. 预加载关键字体
<link rel="preload" href="/fonts/SmileySans-subset.woff2" as="font" crossorigin>
```

**预期收益**: 字体总大小从 1.5 MB → ~200 KB

#### 任务 1.3: 图片优化 (优先级: P1)
```typescript
// 1. 壁纸图片转 WebP + 懒加载
const BackgroundImage = () => (
  <picture>
    <source srcSet="/images/bg1.webp" type="image/webp" />
    <img src="/images/bg1.jpg" loading="lazy" />
  </picture>
)

// 2. Icon 图标雪碧图或转 SVG
// 减少 HTTP 请求

// 3. 响应式图片
<img 
  srcSet="bg-480.webp 480w, bg-800.webp 800w, bg-1920.webp 1920w"
  sizes="100vw"
/>
```

**预期收益**: 图片体积减少 50%,首屏加载速度提升 30%

#### 任务 1.4: 渲染优化 (优先级: P1)
```typescript
// 1. 光标动画优化 - 静止时停止 RAF
class Cursor {
  render() {
    if (!this.isMoving()) {
      this.stopRAF()  // 新增: 停止条件
      return
    }
    requestAnimationFrame(() => this.render())
  }
  
  isMoving() {
    // 检测鼠标是否移动
    return this.pos.curr.x !== this.pos.prev.x || 
           this.pos.curr.y !== this.pos.prev.y
  }
}

// 2. 时钟组件防抖 - 使用 CSS 动画代替 setInterval
// 只在秒切换时更新组件,不是每帧都渲染

// 3. 使用 React.memo 优化不变组件
export default memo(Footer)
export default memo(SocialLinks)
```

**预期收益**: CPU 使用率降低 40%,电池续航改善

#### 任务 1.5: 构建优化 (优先级: P2)
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['antd', '@icon-park/react'],
          'vendor-music': ['aplayer'],
          'vendor-query': ['@tanstack/react-query'],
        }
      }
    }
  }
})
```

**预期收益**: 长期缓存优化,重复访问速度提升

---

### 阶段二: 架构重构 (2 周) 🏗️

**目标**: 代码可维护性大幅提升,技术债清零

#### 任务 2.1: 状态管理重构 (优先级: P0)
```typescript
// 前: 单一 store,49 个字段
interface MainState {
  imgLoadStatus: boolean
  innerWidth: number | null
  coverType: string
  // ... 46 more fields
}

// 后: 按功能域拆分
// features/player/store/usePlayerStore.ts
interface PlayerState {
  isPlaying: boolean
  currentTrack: Track | null
  volume: number
  playlist: Track[]
  // 仅播放器相关状态
}

// features/ui/store/useUIStore.ts
interface UIState {
  isMobileMenuOpen: boolean
  isSettingsOpen: boolean
  windowWidth: number
  // 仅 UI 交互状态
}

// features/settings/store/useSettingsStore.ts
interface SettingsState {
  wallpaperType: string
  musicAutoplay: boolean
  // 仅用户偏好设置
}
```

**迁移策略**: 
1. 新建模块化 store
2. 组件逐个迁移到新 store
3. 旧 store 保留直到所有组件迁移完成
4. 删除旧 store

#### 任务 2.2: API 层增强 (优先级: P0)
```typescript
// 新建 shared/api/client.ts
class APIClient {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000), // 10s 超时
      })
      
      if (!response.ok) {
        throw new APIError(response.status, await response.text())
      }
      
      return await response.json()
    } catch (error) {
      // 统一错误处理
      if (error instanceof APIError) {
        this.handleAPIError(error)
      }
      throw error
    }
  }
  
  private handleAPIError(error: APIError) {
    // 根据状态码分类处理
    if (error.status === 429) {
      notice()?.open({ content: '请求过于频繁,请稍后再试' })
    } else if (error.status >= 500) {
      notice()?.open({ content: '服务器错误,请稍后再试' })
    }
  }
}

// 使用 React Query 管理异步状态
const useWeather = () => {
  return useQuery({
    queryKey: ['weather'],
    queryFn: () => apiClient.getWeather(),
    staleTime: 30 * 60 * 1000, // 30 分钟缓存
    retry: 2,
  })
}
```

#### 任务 2.3: 播放器替换 (优先级: P1)
```typescript
// 现状: APlayer (jQuery 时代,4.5 KB gzip)
// 问题: DOM 直接操作,与 React 理念冲突

// 方案: 使用 React 原生 <audio> + Howler.js
// Howler.js: 15 KB gzip,纯 JS,无 DOM 操作

// features/player/components/Player.tsx
import { Howl } from 'howler'

const useAudioPlayer = () => {
  const [howl, setHowl] = useState<Howl | null>(null)
  
  const play = useCallback((track: Track) => {
    const sound = new Howl({
      src: [track.url],
      html5: true,
      onplay: () => setPlayerState({ isPlaying: true }),
      onpause: () => setPlayerState({ isPlaying: false }),
      onend: () => playNext(),
    })
    
    setHowl(sound)
    sound.play()
  }, [])
  
  return { play, pause, setVolume }
}
```

**预期收益**: 
- 去除 APlayer 依赖 (~50 KB)
- 去除歌词 DOM 查询的 hack
- 更好的 React 集成

#### 任务 2.4: 组件拆分与职责清晰化 (优先级: P1)
```typescript
// App.tsx 职责拆分

// 前: App.tsx 169 行,承担过多职责
function App() {
  // 主题配置
  // 全局事件监听
  // 路由逻辑
  // 加载状态
  // ...
}

// 后: 职责分离
// app/App.tsx - 仅应用外壳
function App() {
  return (
    <Providers>
      <Router />
    </Providers>
  )
}

// app/providers/AppProviders.tsx - 统一管理 Providers
export function Providers({ children }) {
  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  )
}

// app/hooks/useGlobalEvents.ts - 全局事件监听
export function useGlobalEvents() {
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    const handleMiddleClick = (e: MouseEvent) => {
      if (e.button === 1) toggleWallpaper()
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousedown', handleMiddleClick)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousedown', handleMiddleClick)
    }
  }, [])
}
```

#### 任务 2.5: 类型安全增强 (优先级: P2)
```typescript
// 安装 Zod 用于运行时校验
// npm install zod

// features/weather/types.ts
import { z } from 'zod'

const WeatherSchema = z.object({
  city: z.string(),
  weather: z.string(),
  temperature: z.number().or(z.string()),
  winddirection: z.string(),
  windpower: z.string(),
})

type Weather = z.infer<typeof WeatherSchema>

// features/weather/api.ts
export async function getWeather(): Promise<Weather> {
  const response = await fetch(WEATHER_API)
  const data = await response.json()
  
  // 运行时校验,防止 API 返回异常数据
  return WeatherSchema.parse(data)
}
```

---

### 阶段三: React 19 现代化 (1-2 周) 🚀

**目标**: 充分利用 React 19 新特性,提升用户体验

#### 任务 3.1: Suspense + Transition 优化加载体验 (优先级: P0)
```typescript
// 1. 使用 Suspense 处理异步组件
import { Suspense } from 'react'

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Background />
      <MainContent />
    </Suspense>
  )
}

// 2. 使用 useTransition 优化状态切换
function WallpaperSelector() {
  const [isPending, startTransition] = useTransition()
  
  const handleChange = (type: string) => {
    startTransition(() => {
      setWallpaperType(type)  // 低优先级更新,不阻塞 UI
    })
  }
  
  return (
    <div>
      <select onChange={e => handleChange(e.target.value)} />
      {isPending && <LoadingIndicator />}
    </div>
  )
}
```

#### 任务 3.2: use() hook 简化异步逻辑 (优先级: P1)
```typescript
// React 19 新特性: use() hook
// 可以在条件语句中使用,替代复杂的 useEffect

// 前: 复杂的 useEffect
function Weather() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    let cancelled = false
    
    fetchWeather().then(result => {
      if (!cancelled) setData(result)
    }).catch(err => {
      if (!cancelled) setError(err)
    })
    
    return () => { cancelled = true }
  }, [])
  
  if (error) return <Error />
  if (!data) return <Loading />
  return <WeatherDisplay data={data} />
}

// 后: use() hook + Suspense
function Weather() {
  const data = use(fetchWeather())  // 自动处理 loading 和 error
  return <WeatherDisplay data={data} />
}

// 配合 ErrorBoundary 捕获错误
<ErrorBoundary fallback={<WeatherError />}>
  <Suspense fallback={<WeatherSkeleton />}>
    <Weather />
  </Suspense>
</ErrorBoundary>
```

#### 任务 3.3: 动画系统升级 (优先级: P1)
```typescript
// 使用 Framer Motion 替代 CSS 动画
// npm install motion (已安装 14.2.0)

// features/wallpaper/components/Background.tsx
import { motion, AnimatePresence } from 'motion/react'

function Background() {
  return (
    <AnimatePresence mode="wait">
      <motion.img
        key={wallpaperUrl}
        src={wallpaperUrl}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </AnimatePresence>
  )
}

// 音乐面板弹出动画
<motion.div
  initial={{ y: 100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: 100, opacity: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
  <MusicPanel />
</motion.div>
```

#### 任务 3.4: 可访问性完善 (优先级: P2)
```typescript
// 1. 完整的键盘导航
function MusicControl() {
  return (
    <>
      <button 
        onClick={playPrev}
        aria-label="上一首"
        onKeyDown={e => e.key === 'ArrowLeft' && playPrev()}
      >
        <PrevIcon />
      </button>
      <button 
        onClick={togglePlay}
        aria-label={isPlaying ? '暂停' : '播放'}
        onKeyDown={e => e.key === ' ' && togglePlay()}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
    </>
  )
}

// 2. ARIA 状态同步
<div 
  role="slider"
  aria-label="音量"
  aria-valuenow={volume}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
/>

// 3. 焦点管理
import { useFocusTrap } from '@/shared/hooks/useFocusTrap'

function Modal() {
  const trapRef = useFocusTrap(isOpen)
  return <div ref={trapRef}>...</div>
}
```

#### 任务 3.5: 错误监控与性能追踪 (优先级: P2)
```typescript
// 1. 添加 React Error Boundary
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert">
      <h2>出错了</h2>
      <pre>{error.message}</pre>
      <button onClick={() => window.location.reload()}>
        刷新页面
      </button>
    </div>
  )
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>

// 2. Web Vitals 监控
import { onCLS, onFID, onLCP } from 'web-vitals'

onCLS(console.log)  // Cumulative Layout Shift
onFID(console.log)  // First Input Delay
onLCP(console.log)  // Largest Contentful Paint

// 3. 性能标记
performance.mark('wallpaper-load-start')
// ... 加载壁纸
performance.mark('wallpaper-load-end')
performance.measure('wallpaper-load', 'wallpaper-load-start', 'wallpaper-load-end')
```

#### 任务 3.6: PWA 增强 (优先级: P3)
```typescript
// 1. 离线优先策略
// workbox 配置已存在,增强缓存策略

// 2. 添加 App Shell
// 将核心 UI 框架缓存,离线也能看到布局

// 3. 后台同步
// Service Worker 后台更新天气/一言数据

// 4. 推送通知 (可选)
// 每日一言推送
```

---

## 四、技术决策记录

### 4.1 为什么不使用 Server Components?
**决策**: 阶段三探索,不作为主要目标

**原因**:
1. 当前是纯前端 SPA,无后端
2. SSR 需要 Node.js 服务器,增加部署复杂度
3. 性能收益有限(已是静态站点)

**何时重新评估**: 如果未来需要 SEO 或首屏性能极致优化

### 4.2 为什么替换 APlayer?
**决策**: 阶段二替换为 Howler.js

**原因**:
1. APlayer 是 jQuery 时代产物,DOM 直接操作
2. 与 React 理念冲突,需要 hack 获取歌词
3. Howler.js 更轻量 (15 KB vs 50 KB),纯 JS
4. 更好的 TypeScript 支持

**风险**: 需要重新实现歌词同步功能

### 4.3 为什么不使用 CSS-in-JS?
**决策**: 保持 Tailwind CSS + CSS Modules

**原因**:
1. 当前 Tailwind 已满足需求
2. CSS-in-JS 有运行时开销
3. React 19 推荐静态 CSS

**例外**: Framer Motion 的内联样式 (动画必需)

### 4.4 为什么按功能域拆分 store?
**决策**: 从单一 store 拆分为多个功能域 store

**原因**:
1. 单一 store 难以维护 (49 个字段)
2. 按功能域拆分便于并行开发
3. 减少不必要的重渲染 (只订阅需要的 store)
4. 更好的代码组织

**实施**: 渐进式迁移,不一次性重写

### 4.5 字体子集化策略
**决策**: 保留常用 3500 汉字 + 完整拉丁字符

**原因**:
1. 覆盖 99% 日常用字
2. 体积从 1.36 MB → ~150 KB
3. 降级策略: 未收录字符使用系统字体

**工具**: fonttools pyftsubset

---

## 五、迁移策略

### 5.1 配置数据适配

**localStorage 键名保持不变**: `data`

**字段映射**:
```typescript
// 旧字段 → 新 store
{
  // UI Store
  coverType → useWallpaperStore.type
  backgroundShow → useUIStore.isWallpaperFullscreen
  boxOpenState → useUIStore.isBoxOpen
  mobileOpenState → useUIStore.isMobileMenuOpen
  setOpenState → useUIStore.isSettingsOpen
  
  // Player Store
  musicVolume → usePlayerStore.volume
  musicClick → useSettingsStore.enableMusicButton
  playerAutoplay → usePlayerStore.autoplay
  playerLoop → usePlayerStore.loop
  playerOrder → usePlayerStore.order
  playerLrcShow → usePlayerStore.showLyrics
  
  // Settings Store
  siteStartShow → useSettingsStore.showSiteStartDate
  footerBlur → useSettingsStore.footerBlur
}
```

**适配代码**:
```typescript
// shared/lib/storage-migration.ts
export function migrateStorage() {
  const oldData = localStorage.getItem('data')
  if (!oldData) return
  
  const parsed = JSON.parse(oldData)
  
  // 迁移到新 store 格式
  useWallpaperStore.setState({ type: parsed.coverType })
  usePlayerStore.setState({ 
    volume: parsed.musicVolume,
    autoplay: parsed.playerAutoplay,
    // ...
  })
  
  // 清理旧数据
  localStorage.removeItem('data')
}
```

### 5.2 渐进式重构流程

**原则**: 每次提交都保持项目可运行

**流程**:
```
1. 创建新模块 (新 store / 新组件)
   ├── 编写新代码
   ├── 编写测试
   └── 提交

2. 迁移一个组件
   ├── 组件内部改用新 API
   ├── 确保功能正常
   └── 提交

3. 重复步骤 2,直到所有组件迁移完成

4. 删除旧代码
   ├── 删除旧 store
   ├── 删除旧 API
   └── 提交
```

**Git 分支策略**:
```
main (始终可运行)
  ├── feat/code-splitting
  ├── feat/font-optimization
  ├── feat/store-refactor
  └── feat/player-replacement
```

每个 feature 分支完成后立即合并,避免长期分支

---

## 六、验收标准

### 阶段一验收标准 (性能优化)
- [ ] JS bundle 初始加载 < 200 KB
- [ ] 字体总大小 < 300 KB
- [ ] 图片全部 WebP 格式 + 懒加载
- [ ] 光标静止时 CPU 使用率 < 1%
- [ ] Lighthouse Performance 分数 > 85
- [ ] 构建产物有明确的 vendor chunks

### 阶段二验收标准 (架构重构)
- [ ] Store 拆分为 4-5 个独立模块
- [ ] 所有 API 调用经过统一客户端
- [ ] 播放器使用 Howler.js,无 DOM 直接操作
- [ ] App.tsx 代码行数 < 50 行
- [ ] 所有组件有明确的单一职责
- [ ] 90% 的 TypeScript strict 模式警告清零

### 阶段三验收标准 (React 19 现代化)
- [ ] 所有异步组件使用 Suspense
- [ ] 关键交互使用 useTransition 优化
- [ ] 所有动画使用 Framer Motion
- [ ] 键盘导航覆盖所有交互元素
- [ ] ARIA 标签完整
- [ ] 有 Error Boundary 保护关键功能
- [ ] Web Vitals 指标全部良好

---

## 七、风险与缓解

### 风险 1: 字体子集化导致部分字符无法显示
**影响**: 低 | **概率**: 中

**缓解**: 
- 使用常用 3500 字 + 网站特定词汇
- 设置降级字体: `font-family: 'SmileySans', 'Microsoft YaHei', sans-serif`
- 监控缺失字符,按需补充

### 风险 2: 播放器替换功能回归
**影响**: 高 | **概率**: 低

**缓解**:
- 详细的功能对比测试清单
- 保留 APlayer 分支作为备份
- 渐进式替换,先替换不带歌词的简单场景

### 风险 3: Store 重构破坏现有功能
**影响**: 中 | **概率**: 中

**缓解**:
- 新旧 store 共存期保持足够长
- 每次迁移一个组件,立即测试
- 保留 localStorage 适配代码

### 风险 4: 代码分割导致加载体验变差
**影响**: 中 | **概率**: 低

**缓解**:
- 关键路径不分割,仅次要功能懒加载
- 使用 `<link rel="prefetch">` 预加载
- 添加 Loading 骨架屏

---

## 八、下一步行动

### 立即开始 (今天)
1. ✅ 创建设计文档
2. ✅ Git 提交基线代码
3. 🔄 **进入阶段一第一个任务: 代码分割**

### 本周完成
- 代码分割 (任务 1.1)
- 字体优化 (任务 1.2)
- 图片优化 (任务 1.3)

### 下周完成
- 渲染优化 (任务 1.4)
- 构建优化 (任务 1.5)
- 阶段一验收

---

## 附录 A: 参考资源

- [React 19 官方文档](https://react.dev/blog/2024/12/05/react-19)
- [Vite 性能优化指南](https://vitejs.dev/guide/performance.html)
- [Web Vitals](https://web.dev/vitals/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Howler.js 文档](https://howlerjs.com/)
- [Framer Motion 文档](https://www.framer.com/motion/)

---

**设计文档版本**: v1.0  
**最后更新**: 2026-10-14  
**状态**: 待审核
