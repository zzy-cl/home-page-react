# 呓语工位(Monologue Deck)实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 home-page-react 仓库内,清空起始页旧实现,重写为 Bento Grid 开发者身份站点(呓语工位)。

**Architecture:** React 19 SPA + TanStack Router(代码式路由,3 个 lazy 页面)+ TanStack Query(外部数据)+ Tailwind 4 CSS 变量令牌(Glass 2.0)+ 自研 Cmd+K 与终端彩蛋(纯函数核心 + UI 壳)。部署流水线(Jenkins/Docker/nginx)零改动,`npm run build` 产物不变。

**Tech Stack:** React 19 · TypeScript(strict) · Vite 8 · TanStack Router · TanStack Query · Tailwind CSS 4 · motion · zustand(仅浮层 UI 状态) · Vitest(仅纯函数) · lucide-react · @fontsource/jetbrains-mono

**Spec:** `docs/superpowers/specs/2026-10-19-monologue-deck-redesign.md`

## Global Constraints

- TS strict 开启;新代码禁止 `any`(测试 mock 除外)。
- 首页首屏 JS(gzip)< 100 KB;Lighthouse Performance(桌面)≥ 95。
- 动画仅 `transform`/`opacity`;禁止动画 `width/left/top/box-shadow`;任何 rAF 循环必须有休眠条件(本项目 v1 预期无 rAF)。
- 设计令牌 verbatim(spec §3.1):`--bg-0: #0d0f12`、`--bg-1: #16181d`、`--glass-bg: rgba(255,255,255,0.06)`、`--glass-border: rgba(255,255,255,0.10)`、`--glass-blur: 20px`、`--accent: #7aa2ff`(轮换备选 `#ff9e64`、`#b47aff`)、`--font-mono: 'JetBrains Mono', 'Cascadia Code', Consolas, monospace`、`--radius-card: 16px`、`--radius-inner: 10px`、`--gap-grid: 12px`。
- 移除依赖:antd、@icon-park/react、aplayer、fetch-jsonp、swiper、vite-plugin-pwa、@types/fetch-jsonp、dayjs。
- 新增依赖:@tanstack/react-router、lucide-react、@fontsource/jetbrains-mono、vitest、js-yaml 不引入(frontmatter 自解析)。
- 保留依赖:react/react-dom、@tanstack/react-query、zustand、motion、tailwindcss 4、@tailwindcss/vite、vite、typescript、vite-plugin-compression2、terser。
- 外部 API:热力图 `https://github-contributions-api.jogruber.de/v4/{user}`(spec 修正:GitHub 无公开 REST 热力图,此为社区标准无 key 服务);star 数官方 `https://api.github.com/repos/{repo}`;一言 `https://v1.hitokoto.cn/?c=a&c=b&c=k&c=i`。
- 所有失败的外部数据一律静默降级为占位 UI,禁止弹 toast、禁止白屏。
- 提交信息中文,`feat:`/`fix:`/`chore:`/`test:` 前缀,与仓库既有风格一致。
- 移动端(`<768px`)单列;768–1279 双列;≥1280 十二列 Bento。

## Review Focus

spec 隐含、但任务测试未直接覆盖、最容易咬到真实使用者的输入,以及钉住它们的测试:

1. **GitHub 接口失败/限流(60 req/h)** — 热力图与 star 卡应渲染占位骨架,页面其余部分不受影响。测试:`features/github/api.ts` 的 `fetchContributions` 在 fetch reject 时返回 `null` 而非 throw(Task 7)。
2. **一言接口失败** — 迷你卡显示固定语句,点击重试不抛错。测试:`fetchHitokoto` reject → 返回 `null`(Task 8)。
3. **`~` 键在文本输入时误触终端** — input/textarea 聚焦或 Cmd+K 打开时,按 `~` 不得打开终端。测试:`shouldOpenTerminal` 纯函数(Task 10)。
4. **now 条目 frontmatter 缺字段/无 frontmatter** — 解析器返回条目且字段兜底为空串,不抛错不崩溃。测试:`parseFrontmatter` / `parseNowEntry` 容错用例(Task 5)。
5. **移动端无键盘** — Cmd+K 靠提示条点击呼出、终端经 Cmd+K 内 `Terminal` 命令可达。手动验收清单(Task 11)。

---

### Task 1: 清场 — 删旧代码、换依赖、最小可构建骨架

**Files:**
- Delete: `src/`(整目录)、`public/images/`、`public/font/`
- Modify: `package.json`、`vite.config.ts`、`index.html`、`.env`、`.dockerignore`(确认含 `node_modules`/`dist`)
- Create: `src/main.tsx`、`src/App.tsx`、`src/index.css`(空壳)

**Interfaces:**
- Produces: 可构建、可跑 vitest 的干净基线;`src/App.tsx` 导出默认组件渲染 `<div>monologue-deck</div>`;vite define 注入 `__BUILD_TIME__: string`(ISO 字符串,Task 10 的 `neofetch` 消费)。

- [ ] **Step 1: 删除旧源码与静态资产**

```bash
git rm -r src public/images public/font
```

- [ ] **Step 2: 调整 `package.json`**

scripts 增加 `"test": "vitest run --passWithNoTests"`。dependencies 删除:`antd`、`@icon-park/react`、`aplayer`、`fetch-jsonp`、`swiper`、`dayjs`、`@types/fetch-jsonp`(在 devDependencies);devDependencies 删除 `vite-plugin-pwa`。新增 dependencies:`@tanstack/react-router`、`lucide-react`、`@fontsource/jetbrains-mono`;devDependencies 新增 `vitest`。保留:`react`、`react-dom`、`@tanstack/react-query`、`zustand`、`motion`、`vite`、`@vitejs/plugin-react`、`@rolldown/plugin-babel`、`babel-plugin-react-compiler`、`@babel/core`、`@types/babel__core`、`tailwindcss`、`@tailwindcss/vite`、`typescript`、`vite-plugin-compression2`、`terser` 及 eslint/types 相关全部。

- [ ] **Step 3: 重写 `vite.config.ts`**

保留:`react()`、`babel(reactCompilerPreset)`、`tailwindcss()`、`compression()`、terser(`pure_funcs: ['console.log']`,`drop_console` 改为 `false`——开发期保留报错输出,上线前 Task 11 再开)、server.open、`@` alias、`assetFileNames`/`chunkFileNames`/`entryFileNames`。移除:`VitePWA` 整段。manualChunks 仅保留 react/react-dom 一组(其余交 rolldown 默认)。顶部改 `import { defineConfig } from 'vitest/config'`,增加:

```ts
test: { environment: 'node' },
define: { __BUILD_TIME__: JSON.stringify(new Date().toISOString()) },
```

并在 `env.d.ts`(新建于 `src/`)声明 `declare const __BUILD_TIME__: string` 与 `/// <reference types="vite/client" />`。

- [ ] **Step 4: 重写 `index.html` 与 `.env`**

index.html:保留 `<meta charset/viewport/description/keywords/author/theme-color>` 与 `<title>呓语工位</title>`,删除全部 `<link rel="icon|apple-touch-icon|bookmark">`(favicon 后续 Task 11 补)与 `Access-Control-Allow-Origin` meta。`.env`:仅保留 `VITE_SITE_NAME`(值 `呓语工位`)、`VITE_SITE_URL`、`VITE_GITHUB_USER`(值 `zzy-cl`,执行者按仓库 owner 实测修正)、`VITE_SITE_GITHUB`(仓库主页链接)、`VITE_SITE_EMAIL`;删除所有 `VITE_SONG_*`、`VITE_WEATHER_KEY`、`VITE_DESC_*`、`VITE_SITE_START`、`VITE_SITE_ICP` 等旧变量。

- [ ] **Step 5: 最小骨架**

`src/App.tsx` 导出默认组件返回 `<div className="p-8">monologue-deck</div>`;`src/main.tsx` createRoot 挂载 `<App />`;`src/index.css` 仅一行 `@import 'tailwindcss';`。

- [ ] **Step 6: 安装并验证**

Run: `npm install`
Run: `npm run build`
Expected: 构建成功,`dist/` 生成。
Run: `npm run test`
Expected: pass(no tests)。

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: 清空旧起始页实现,切换依赖与构建配置,建立 monologue-deck 干净基线"
```

---

### Task 2: Glass 2.0 设计令牌与全局样式

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: CSS 变量(spec Global Constraints verbatim)+ Tailwind 4 `@theme` 桥接,后续所有任务通过 Tailwind 类(`bg-[var(--bg-1)]`、`text-[var(--text-1)]`、`rounded-[var(--radius-card)]`)或工具类消费。提供可复用类:`.glass-card`、`.mono`。

- [ ] **Step 1: 写 `src/index.css`**

结构:`@import 'tailwindcss';` → `@import '@fontsource/jetbrains-mono/latin-400.css';` 与 `latin-700.css` → `:root { ...全部令牌 }` → `@theme inline { --font-mono: var(--font-mono); --color-accent: var(--accent); }` → 基础 reset(`html,body` 满屏、`--bg-0` 底色、antialiased)→ `.glass-card { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-card); backdrop-filter: blur(var(--glass-blur)); box-shadow: var(--glass-highlight); }` → `.mono { font-family: var(--font-mono); }` → accent 过渡:`:root { transition: none }` 不需要——accent 轮换直接改 `--accent`,不做过渡(红线)。

- [ ] **Step 2: 验证**

Run: `npm run dev`
Expected: 页面深空灰底(`#0d0f12`),无样式报错。

- [ ] **Step 3: Commit**

```bash
git add src/index.css && git commit -m "feat: Glass 2.0 设计令牌与全局样式"
```

---

### Task 3: TanStack Router 路由骨架(三页 lazy)

**Files:**
- Create: `src/app/router.tsx`、`src/pages/Home.tsx`、`src/pages/Uses.tsx`、`src/pages/Now.tsx`
- Modify: `src/App.tsx`、`src/main.tsx`

**Interfaces:**
- Produces: `src/app/router.tsx` 导出 `router`(createRouter 实例);三页均为默认导出组件,`React.lazy(() => import('@/pages/Home'))` 形式接入;`App.tsx` 渲染 `<RouterProvider router={router} />` 外包 `<QueryClientProvider>`。后续任务通过 TanStack Router 的 `useNavigate`/`<Link>` 跳转 `to: '/' | '/uses' | '/now'`。

- [ ] **Step 1: 写路由**

代码式路由:`createRootRoute` 根组件渲染 `<Outlet />` + 极简页脚(名字 mono 小字);`createRoute({ getParentRoute, path: '/', component: lazyHome })` 等三条;`createRouter({ routeTree })`。lazy 接法:`const HomeC = lazy(() => import('@/pages/Home'))`,组件包 `<Suspense fallback={null}>`(页面级 fallback null 即可,不闪 spinner)。

- [ ] **Step 2: 三页占位**

每页暂返回 `<div className="p-8 mono">{title}</div>`(Home/Uses/Now)。

- [ ] **Step 3: 验证**

Run: `npm run dev`
Expected: `/`、`/uses`、`/now` 可导航;未知路径显示 TanStack Router 默认 notFound(不处理自定义,v1 不需要)。

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: TanStack Router 三页路由骨架,页面级代码分割"
```

---

### Task 4: BentoCard 原语 + Home 静态 Bento(假数据)

**Files:**
- Create: `src/components/BentoCard.tsx`、`src/components/Kbd.tsx`、`src/pages/Home.tsx`(重写)
- Modify: 无

**Interfaces:**
- Produces: `BentoCard({ title?, className?, children }: { title?: string; className?: string; children: ReactNode })` — 玻璃卡片原语,内置 hover 边框提亮(仅 `border-color` 过渡?否——红线禁 border 动画,hover 用 `transform: scale(1.01)` + 一次性 transition transform 0.2s)与 motion 入场(容器 `motion.div` `staggerChildren: 0.06`);`Kbd({ children })` — `⌘K` 键帽样式(mono、小圆角、`--glass-bg` 底)。Home 页网格类名骨架:`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-[var(--gap-grid)]`,卡片 span 按 spec §4.1(见 Step 1)。

- [ ] **Step 1: 实现 BentoCard 与 Kbd**

入场动画由 Home 的父容器统一编排:`const grid = motion.div variants={{ show: { transition: { staggerChildren: 0.06 } } }}`,每张 BentoCard 外层 `motion.section variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}`(总时长 < 600ms 约束成立)。

- [ ] **Step 2: Home 静态布局**

span 布局(lg):Hero `col-span-7 row-span-2`、热力图 `col-span-3`、now 摘要 `col-span-2`、项目 `col-span-6`、uses 摘要 `col-span-2`、一言 `col-span-2`、Cmd+K 提示 `col-span-2`。md(768–1279):Hero `col-span-2`、其余各 `col-span-1`(热力图与项目 `col-span-2`)。本任务全部内容为占位假数据(卡片标题 + 2 行灰色占位文本),数据接入在 Task 6/8。

- [ ] **Step 3: 视觉验收**

Run: `npm run dev` → 1280 宽浏览器窗口。
Expected: 3 列 Bento、卡片交错入场、hover 轻微放大;窗口缩到 800 / 400 布局相应变 2 列/1 列,无横向滚动。

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: BentoCard 原语与首页静态 Bento 布局(假数据)"
```

---

### Task 5: 内容层 — site/uses/projects 数据 + now Markdown 管道(TDD)

**Files:**
- Create: `src/content/site.ts`、`src/content/uses.ts`、`src/content/projects.data.ts`、`src/content/now/2026-10-19-hello-monologue-deck.md`、`src/lib/md.ts`
- Test: `src/lib/md.test.ts`

**Interfaces:**
- Produces:
  - `site.ts`: `export const site = { name: string; tagline: string; keywords: string[]; github: string; email: string; githubUser: string } as const`(tagline 站长后续可改,占位:`'把想法变成代码的人'`;keywords: `['Vue3','React','Rust','TypeScript','AI','Vibe Coding']`)。
  - `uses.ts`: `export interface UseItem { name: string; note: string }`、`export interface UseSection { title: '硬件'|'编辑器与工具'|'技术栈'|'服务'; items: UseItem[] }`、`export const useSections: UseSection[]`(每区先放 2–3 条合理占位,标注站长替换)。
  - `projects.data.ts`: `export interface ProjectInfo { repo: string /* 'owner/name' */; name: string; desc: string }`、`export const projects: ProjectInfo[]`(3 条占位:`zzy-cl/home-page-react` 真实 + 2 条占位)。
  - `md.ts`: `export interface NowEntry { date: string; title: string; body: string }`;`export function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string }`;`export function parseNowEntry(raw: string): NowEntry`;`export function sortNowEntries(entries: NowEntry[]): NowEntry[]`(date 倒序,YYYY-MM-DD 字典序);`export function loadNowEntries(): NowEntry[]`(`import.meta.glob('@/content/now/*.md', { query: '?raw', import: 'default', eager: true })`)。
- Consumes: 无。

- [ ] **Step 1: 写失败测试 `src/lib/md.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { parseFrontmatter, parseNowEntry, sortNowEntries } from './md'

describe('parseFrontmatter', () => {
  it('解析标准 frontmatter', () => {
    const { meta, body } = parseFrontmatter('---\ntitle: 你好\ndate: 2026-10-19\n---\n正文')
    expect(meta).toEqual({ title: '你好', date: '2026-10-19' })
    expect(body).toBe('正文')
  })
  it('无 frontmatter 时 meta 为空、body 为全文', () => {
    const { meta, body } = parseFrontmatter('只有正文')
    expect(meta).toEqual({})
    expect(body).toBe('只有正文')
  })
  it('frontmatter 未闭合时按无 frontmatter 处理', () => {
    const { meta } = parseFrontmatter('---\ntitle: 未闭合')
    expect(meta).toEqual({})
  })
  it('值中的冒号不破坏解析', () => {
    const { meta } = parseFrontmatter('---\ntitle: a: b\n---\nx')
    expect(meta.title).toBe('a: b')
  })
})

describe('parseNowEntry 容错', () => {
  it('缺 title 兜底空串,不抛错', () => {
    const e = parseNowEntry('---\ndate: 2026-10-19\n---\n正文')
    expect(e.title).toBe('')
    expect(e.body).toBe('正文')
  })
  it('缺 date 兜底空串', () => {
    expect(parseNowEntry('---\ntitle: t\n---\nb').date).toBe('')
  })
})

describe('sortNowEntries', () => {
  it('按 date 倒序', () => {
    const sorted = sortNowEntries([
      { date: '2026-01-01', title: 'a', body: '' },
      { date: '2026-10-01', title: 'b', body: '' },
    ])
    expect(sorted[0].title).toBe('b')
  })
})
```

- [ ] **Step 2: 运行确认失败**

Run: `npx vitest run src/lib/md.test.ts`
Expected: FAIL(`Cannot find module './md'`)。

- [ ] **Step 3: 实现 `src/lib/md.ts`**

规则:trim 后以 `---\n` 开头才解析 frontmatter;逐行 `key: value`(首个冒号分割,value trim,保留值内冒号);遇闭合 `---` 停止;解析结果兜底:date/title 取 `meta.date ?? ''`。body 为闭合行之后内容 trim。`loadNowEntries` 内部调 `parseNowEntry` + `sortNowEntries`。

- [ ] **Step 4: 运行确认通过**

Run: `npx vitest run src/lib/md.test.ts`
Expected: PASS(10 assertions)。

- [ ] **Step 5: 内容文件与首篇 now**

创建 `site.ts`、`uses.ts`、`projects.data.ts`、示例 md(frontmatter:`date: 2026-10-19`、`title: 呓语工位上线重构启动`,正文两段)。

- [ ] **Step 6: 验证并提交**

Run: `npm run build && npm run test`
Expected: 均通过。
```bash
git add -A && git commit -m "feat: 站点内容层(uses/projects/now)与 Markdown frontmatter 解析器"
```

---

### Task 6: Uses 页、Now 页与 Home 摘要卡接真数据

**Files:**
- Modify: `src/pages/Uses.tsx`(重写)、`src/pages/Now.tsx`(重写)、`src/pages/Home.tsx`(摘要卡区域)
- Create: `src/features/command/registry.ts` 的空壳 **不做**——本任务仅页面。

**Interfaces:**
- Consumes: Task 5 的 `useSections`、`projects`、`loadNowEntries()`、`site`。
- Produces: `Now.tsx` 导出的页面;Home 的 `/now` 摘要卡数据取自 `loadNowEntries()[0]`(空数组时显示占位"暂无近况"),`/uses` 摘要卡取 `useSections` 中每区第一条 `name` 拼合(空时占位)。页面结构见 spec §4.2/§4.3。

- [ ] **Step 1: Uses 页**

每区一个 `BentoCard title={section.title}`,列表项为 `name`(text-0)+ `note`(text-1 小字);区与区之间常规文档流(非 Bento,纵向 `max-w-3xl mx-auto`)。

- [ ] **Step 2: Now 页**

按倒序渲染条目:日期(mono,`--accent` 色)+ 标题 + 段落(body 按 `\n\n` 分段渲染 `<p>`)。空列表显示占位。

- [ ] **Step 3: Home 摘要卡接数据**

now 摘要卡:首条 title + body 截断 60 字符 + 「查看全部 →」(`Link to="/now"`,hover 时 `text-[var(--accent)]`);uses 摘要卡:3 条 `name` mono 短标签 + 「查看全部 →」。

- [ ] **Step 4: 验证并提交**

Run: `npm run dev` → 逐页检查三页数据渲染与跳转。
Run: `npm run build`
Expected: 通过。
```bash
git add -A && git commit -m "feat: uses/now 页面与首页摘要卡接入内容数据"
```

---

### Task 7: GitHub 数据层(TDD,含失败降级)

**Files:**
- Create: `src/features/github/api.ts`
- Test: `src/features/github/api.test.ts`

**Interfaces:**
- Produces:
  - `export interface ContributionDay { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }`
  - `export interface ContributionYear { total: number; days: ContributionDay[] }`
  - `export function parseContributions(payload: unknown): ContributionYear` — 输入为 jogruber v4 响应 `{ total: Record<string, number>; contributions: Array<{ date: string; count: number; level: number }> }`;`level` 夹取至 0–4;非法输入(缺字段/非数组)throw `Error('invalid contributions payload')`。
  - `export async function fetchContributions(user: string): Promise<ContributionYear | null>` — 内部 try/catch,**任何失败返回 `null`,不 throw**。
  - `export async function fetchRepoStars(repo: string): Promise<number | null>` — GET `https://api.github.com/repos/${repo}` 取 `stargazers_count`;失败返回 `null`。
  - `src/features/github/hooks.ts`: `useContributions()`(key `['gh-contrib']`,staleTime 1h,retry 1,`user` 取 `site.githubUser`)与 `useRepoStars()`(对 `projects` 逐仓库 `useQuery` 并返回 `{ repo, stars }[]`,key `['gh-stars', repo]`)。

- [ ] **Step 1: 写失败测试**

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchContributions, parseContributions } from './api'

const valid = {
  total: { '2026': 120 },
  contributions: [
    { date: '2026-01-01', count: 3, level: 1 },
    { date: '2026-01-02', count: 9, level: 4 },
  ],
}

describe('parseContributions', () => {
  it('解析合法 payload', () => {
    const y = parseContributions(valid)
    expect(y.total).toBe(120)
    expect(y.days).toHaveLength(2)
    expect(y.days[1]).toEqual({ date: '2026-01-02', count: 9, level: 4 })
  })
  it('level 超界夹取到 0-4', () => {
    const y = parseContributions({ ...valid, contributions: [{ date: 'd', count: 1, level: 7 }] })
    expect(y.days[0].level).toBe(4)
  })
  it('非法 payload 抛错', () => {
    expect(() => parseContributions({})).toThrow('invalid contributions payload')
    expect(() => parseContributions({ total: {}, contributions: 'no' })).toThrow()
  })
})

describe('fetchContributions', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('网络失败返回 null 而不 throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    await expect(fetchContributions('x')).resolves.toBeNull()
  })
  it('HTTP 500 返回 null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    await expect(fetchContributions('x')).resolves.toBeNull()
  })
  it('成功路径解析数据', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => valid }))
    const y = await fetchContributions('x')
    expect(y?.total).toBe(120)
  })
})
```

- [ ] **Step 2: 运行确认失败**

Run: `npx vitest run src/features/github/api.test.ts`
Expected: FAIL(module not found)。

- [ ] **Step 3: 实现 `api.ts` 与 `hooks.ts`**

`fetchContributions`: `fetch(`https://github-contributions-api.jogruber.de/v4/${user}`)` → `!res.ok` 返回 `null` → `parseContributions(await res.json())`(parse throw 时外层 catch 返回 `null`)。`fetchRepoStars` 同模式,`stargazers_count` 非数字时返回 `null`。

- [ ] **Step 4: 运行确认通过**

Run: `npx vitest run src/features/github/api.test.ts`
Expected: PASS(7 assertions)。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: GitHub 贡献热力图与 star 数据层,失败静默降级"
```

---

### Task 8: GitHub 卡片 UI + 一言卡

**Files:**
- Create: `src/features/github/Heatmap.tsx`、`src/features/hitokoto/api.ts`、`src/features/hitokoto/api.test.ts`、`src/features/hitokoto/HitokotoCard.tsx`
- Modify: `src/pages/Home.tsx`(热力图卡、项目卡 star、一言卡接入)

**Interfaces:**
- Consumes: Task 7 的 `useContributions`/`useRepoStars`/`ContributionYear`;Task 5 的 `projects`。
- Produces: `fetchHitokoto(): Promise<{ text: string; from: string } | null>`(GET 一言 API,取 `hitokoto`/`from` 字段,失败 `null`);`Heatmap({ data }: { data: ContributionYear | null })`。

- [ ] **Step 1: 一言数据层测试(失败先行)**

`api.test.ts` 三用例:成功解析 `{ hitokoto: 't', from: 'f' }` → `{ text: 't', from: 'f' }`;fetch reject → `null`;`!ok` → `null`。实现 `fetchHitokoto`(与 Task 7 同 try/catch 模式)。Run: `npx vitest run src/features/hitokoto/api.test.ts` → PASS。

- [ ] **Step 2: Heatmap 组件**

`data === null` 或 `days.length === 0` 时渲染 53×7 灰色占位格(`--glass-bg` 底、`--radius-inner` 圆角小方格)。有数据时:53 列 × 7 行 CSS grid(`grid-flow-col`),格子颜色按 level 映射 `rgba(122,162,255, level * 0.22 + (level ? 0.12 : 0))` 背景透明度(level 0 用 `--glass-bg`),`title` 属性显示 `date · count 次`;格子尺寸 `w-[10px] h-[10px]`,小屏允许容器横向滚动(`overflow-x-auto`,红线允许——是滚动不是动画)。卡片头部:total 次贡献(mono 数字)+ GitHub 外链图标(lucide `Github`)。

- [ ] **Step 3: 项目卡接 star**

`useRepoStars()` 遍历 `projects` 渲染 3 个项目行:名称(mono)+ desc(text-1)+ star 数(lucide `Star` + mono 数字;`null` 时显示 `--`)。整个项目行 `<a>` 外链 `https://github.com/${repo}`。

- [ ] **Step 4: 一言卡**

`useQuery({ queryKey: ['hitokoto'], staleTime: 10min })`;卡内文本,点击卡片 `refetch()`;`text` 大字、`from` 为 `—— ${from}` 小字 text-2;`null` 降级固定语句"保持热爱,保持构建"。

- [ ] **Step 5: 验证并提交**

Run: `npm run test` → 全部 PASS。
Run: `npm run dev` → 断网(DevTools offline)刷新:热力图占位、star 为 `--`、一言固定语句,无报错弹窗。
```bash
git add -A && git commit -m "feat: GitHub 热力图/项目 star/一言卡片接入,离线降级"
```

---

### Task 9: UI store + Cmd+K 指令面板(TDD registry)

**Files:**
- Create: `src/store/ui.ts`、`src/features/command/registry.ts`、`src/features/command/registry.test.ts`、`src/features/command/CommandPalette.tsx`
- Modify: `src/App.tsx`(挂载面板)、`src/pages/Home.tsx`(提示条 onClick 接 `openCommand()`)

**Interfaces:**
- Consumes: TanStack Router `useNavigate`。
- Produces:
  - `src/store/ui.ts`(zustand): `interface UiState { commandOpen: boolean; terminalOpen: boolean; setCommandOpen: (v: boolean) => void; setTerminalOpen: (v: boolean) => void; openTerminal: () => void }`;**约定:`openTerminal()` 同时置 `commandOpen: false`**(Cmd+K 内 Terminal 命令的联动,Review Focus 3)。
  - `registry.ts`: `export interface Command { id: string; title: string; keywords: string[]; section: '导航'|'链接'|'主题'|'趣项'; action: () => void }`;`export function filterCommands(cmds: Command[], query: string): Command[]` — query trim 后小写;空串返回全部;否则 title 或任一 keyword `includes` 命中。
  - `CommandPalette.tsx`: 面板组件,内置命令组装(导航三条 `useNavigate`、GitHub/Email 外链、主题轮换——`document.documentElement.style.setProperty('--accent', next)`,顺序 `#7aa2ff → #ff9e64 → #b47aff` 循环,持久化 localStorage key `accent`,初始化时读回;Terminal 命令调 `openTerminal()`;fortune 命令 fetch 一言写 `alert`?**不**——输出为终端打开并打印?定:fortune 在面板内下方显示结果行,简单直接)。
  - 全局快捷键(App 层):`Ctrl/Cmd+K` 切换面板;`Esc` 关闭。

- [ ] **Step 1: 写失败测试**

```ts
import { describe, expect, it } from 'vitest'
import { filterCommands, type Command } from './registry'

const cmds: Command[] = [
  { id: '1', title: '首页', keywords: ['home', 'index'], section: '导航', action: () => {} },
  { id: '2', title: '装备清单', keywords: ['uses', 'gear'], section: '导航', action: () => {} },
  { id: '3', title: 'GitHub', keywords: ['仓库'], section: '链接', action: () => {} },
]

describe('filterCommands', () => {
  it('空 query 返回全部', () => expect(filterCommands(cmds, '')).toHaveLength(3))
  it('纯空格等价空 query', () => expect(filterCommands(cmds, '  ')).toHaveLength(3))
  it('title 命中', () => expect(filterCommands(cmds, '首页')[0].id).toBe('1'))
  it('keyword 命中且大小写不敏感', () => {
    expect(filterCommands(cmds, 'USES').map((c) => c.id)).toEqual(['2'])
  })
  it('无命中返回空数组', () => expect(filterCommands(cmds, 'zzz')).toEqual([]))
})
```

- [ ] **Step 2: 运行确认失败** — Run: `npx vitest run src/features/command/registry.test.ts` → FAIL。

- [ ] **Step 3: 实现 store + registry** — Run 同上 → PASS。

- [ ] **Step 4: 实现 CommandPalette UI**

`<dialog>` 实现(原生 modal,焦点圈定白送):输入框(mono,自动聚焦)、按 section 分组的结果列表、`↑↓` 移动高亮、`Enter` 执行后关闭、`Esc` 关闭。键盘事件在面板内部处理。**加载策略(spec §6.4):App.tsx 中 `const CommandPalette = lazy(() => import('@/features/command/CommandPalette'))`,以 `{commandOpen && <Suspense fallback={null}><CommandPalette /></Suspense>}` 条件渲染——首次触发才拉取 chunk。**

- [ ] **Step 5: 验证并提交**

Run: `npm run dev` → Ctrl+K 打开、输 `now` 过滤出导航项、Enter 跳转 /now;点主题命令页面强调色即时变化且刷新后保持。
```bash
git add -A && git commit -m "feat: Cmd+K 指令面板与全局快捷键,accent 主题轮换"
```

---

### Task 10: 终端彩蛋(TDD commands + shouldOpenTerminal)

**Files:**
- Create: `src/features/terminal/commands.ts`、`src/features/terminal/commands.test.ts`、`src/features/terminal/Terminal.tsx`
- Modify: `src/App.tsx`(`~` 键监听 + 挂载)、`src/features/command/CommandPalette.tsx`(Terminal 命令已接 `openTerminal`,Task 9 完成)

**Interfaces:**
- Consumes: Task 5 `loadNowEntries`/`useSections`/`projects`/`site`;Task 9 `useUiStore`;`__BUILD_TIME__`(Task 1 define)。
- Produces:
  - `export interface TerminalLine { kind: 'input' | 'output' | 'error'; text: string }`
  - `export interface TerminalContext { user: string; now: { date: string; title: string } | null; usesNames: string[]; projects: Array<{ name: string; repo: string }>; buildTime: string; siteStart: string }`
  - `export function executeCommand(input: string, ctx: TerminalContext): TerminalLine[]` — 命令表与输出文案按 spec §5.2 verbatim(`help`/`whoami`/`skills`/`projects`/`now`/`uses`/`fortune`/`neofetch`/`sudo rm -rf /`);未知命令输出 `kind: 'error'`、text ``command not found: ${cmd},输入 help 查看可用命令``;空输入返回空数组。`fortune` 返回占位行 `text: '获取中...'`(真实输出由 Terminal.tsx fetch 后追加一行)。
  - `export function shouldOpenTerminal(e: Pick<KeyboardEvent, 'key'> & { target: EventTarget | null }, blocked: boolean): boolean` — `e.key === '~'` 且 `!blocked`;`blocked` 为 true 当 `(e.target instanceof HTMLElement && ['INPUT','TEXTAREA'].includes(e.target.tagName)) || 面板或终端已开`。

- [ ] **Step 1: 写失败测试**

```ts
import { describe, expect, it } from 'vitest'
import { executeCommand, shouldOpenTerminal, type TerminalContext } from './commands'

const ctx: TerminalContext = {
  user: 'zzy',
  now: { date: '2026-10-19', title: '重构启动' },
  usesNames: ['VS Code'],
  projects: [{ name: '呓语工位', repo: 'zzy-cl/home-page-react' }],
  buildTime: '2026-10-19T00:00:00.000Z',
  siteStart: '2026-10-19',
}

describe('executeCommand', () => {
  it('help 列出全部命令', () => {
    const lines = executeCommand('help', ctx)
    expect(lines.some((l) => l.text.includes('whoami'))).toBe(true)
  })
  it('whoami 含用户名', () => {
    expect(executeCommand('whoami', ctx).some((l) => l.text.includes('zzy'))).toBe(true)
  })
  it('sudo rm -rf / 返回彩蛋文案', () => {
    const lines = executeCommand('sudo rm -rf /', ctx)
    expect(lines[0].text).toContain('权限拒绝')
  })
  it('未知命令报 command not found', () => {
    const [l] = executeCommand('foo', ctx)
    expect(l.kind).toBe('error')
    expect(l.text).toContain('command not found: foo')
  })
  it('空输入返回空数组', () => expect(executeCommand('   ', ctx)).toEqual([]))
  it('命令大小写不敏感', () => {
    expect(executeCommand('HELP', ctx).length).toBeGreaterThan(0)
  })
})

describe('shouldOpenTerminal', () => {
  const k = (target: EventTarget | null) => ({ key: '~', target })
  it('普通目标且未阻塞时打开', () => {
    expect(shouldOpenTerminal(k(document.body), false)).toBe(true)
  })
  it('input 聚焦时不打开', () => {
    const input = document.createElement('input')
    expect(shouldOpenTerminal(k(input), false)).toBe(false)
  })
  it('已阻塞时不打开', () => {
    expect(shouldOpenTerminal(k(document.body), true)).toBe(false)
  })
  it('非 ~ 键不打开', () => {
    expect(shouldOpenTerminal({ key: 'a', target: document.body }, false)).toBe(false)
  })
})
```

> 注意:此测试需要 DOM(`document.createElement`),Task 1 的 vitest environment 为 `node` 会在 `document` 处报错。修改 `vite.config.ts` 的 test 配置为 `environment: 'jsdom'` 并安装 `jsdom`(devDependency)。若不想引 jsdom:改测试为传入 `{ key: '~', target: { tagName: 'INPUT' } as unknown as EventTarget }` 的伪对象并保持 environment: node。**执行者二选一,推荐 jsdom。**

- [ ] **Step 2: 运行确认失败** — Run: `npx vitest run src/features/terminal/commands.test.ts` → FAIL。

- [ ] **Step 3: 实现 `commands.ts`** — Run 同上 → PASS(10 assertions)。

- [ ] **Step 4: 实现 Terminal UI**

**加载策略同 Cmd+K:`const Terminal = lazy(() => import('@/features/terminal/Terminal'))` + `{terminalOpen && <Suspense fallback={null}><Terminal /></Suspense>}`。**

全屏浮层(`fixed inset-0 z-50 bg-black/80 backdrop-blur`),内部伪终端窗口(`max-w-3xl mx-auto mt-[10vh] glass-card p-6 mono`):历史区(按 kind 着色:input 前缀 `$`、error 用 `#ff6b6b`)+ 输入行(`$ ` 前缀 + 无边框 input 自动聚焦);回车执行并把 input 行与输出行 append;`↑` 回溯历史输入;点击浮层背景关闭;fortune 特殊处理:执行后 fetch 一言,追加输出行(失败追加 `一言获取失败`)。`neofetch` 输出含 `site.name`、`buildTime`、运行天数(`Date.now() - Date.parse(siteStart)` 换算天)、技术关键词。

- [ ] **Step 5: 快捷键接线(App.tsx)**

window `keydown`:先算 `blocked = commandOpen || terminalOpen`,再 `shouldOpenTerminal(e, blocked)` → `openTerminal()`(联动已关面板)。

- [ ] **Step 6: 验证并提交**

Run: `npm run test` → 全 PASS。
Run: `npm run dev` → 手动:`~` 开终端;`help`/`neofetch`/`sudo rm -rf /` 输出正确;聚焦任意 input 按 `~` 不触发;Cmd+K 内 `Terminal` 命令关面板开终端。
```bash
git add -A && git commit -m "feat: 终端彩蛋(命令解析与 UI),与 Cmd+K 互斥联动"
```

---

### Task 11: 生产打磨 — 响应式、favicon、性能验收

**Files:**
- Modify: `vite.config.ts`(terser `drop_console: true` 恢复)、`index.html`(favicon)
- Create: `public/favicon.svg`(简单 mono 字符"呓"或终端方块 SVG,`--accent` 色系)
- Create: `docs/lighthouse-2026-10.md`(验收记录)

**Interfaces:**
- Consumes: 全部前序任务。
- Produces: 达标的可部署产物。

- [ ] **Step 1: 响应式巡检**

375 / 768 / 1024 / 1440 / 1920 五档窗口过三页 + 终端 + Cmd+K:无横向滚动、触点 ≥ 40px、mono 数字无换行断裂。问题就地修。

- [ ] **Step 2: favicon 与 meta 收口**

`public/favicon.svg` + index.html `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`;meta description 更新为工位定位一句话。

- [ ] **Step 3: 体积预算实测**

Run: `npm run build`
检查 `dist/assets/js/*.js.gz` 之和:首屏(非 lazy chunk)`< 100 KB`。超预算时按序处置:检查 manualChunks 是否误并 lazy chunk → lucide 图标确认按需导入(不 `import * as`)→ motion 确认非首屏卡不需要的部分不进首 chunk。

- [ ] **Step 4: Lighthouse 验收**

Run: `npm run preview` → Chrome DevTools Lighthouse(Desktop、Performance)。
Expected: ≥ 95;结果与四项核心指标记录进 `docs/lighthouse-2026-10.md`。未达标时以 Lighthouse 报告为据修复后复测。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: 生产打磨——favicon、drop_console、性能预算与 Lighthouse 验收记录"
```

---

### Task 12: 部署验收(M5)

**Files:**
- Create: `docs/deploy-check-2026-10.md`

**Interfaces:**
- Consumes: 现有 Jenkins 流水线(零改动)。

- [ ] **Step 1: 推送触发流水线**

Run: `git push`
Monitor: Jenkins 构建 → `docker compose up -d` 成功。

- [ ] **Step 2: 线上检查清单(记录进 docs/deploy-check-2026-10.md)**

`/`、`/uses`、`/now` 直达可刷新(nginx SPA fallback 生效);`~` 终端与 Cmd+K 在线上可用;响应头含 `Content-Encoding: gzip`(gzip_static 生效);热力图/star 在线上加载;手机端过一遍 Review Focus 第 5 条。

- [ ] **Step 3: 收尾 Commit**

```bash
git add docs/deploy-check-2026-10.md && git commit -m "docs: 上线验收记录"
```
