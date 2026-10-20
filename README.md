# 呓语小屋 · home-page-react

一个前端开发者的个人主页:深色玻璃拟态(Bento 工位)+ Cmd+K 全站指令面板 + 终端彩蛋。
纯静态构建,nginx 容器托管,Jenkins 流水线部署(见 [docs/jenkins-deploy.md](docs/jenkins-deploy.md))。

技术栈:React 19 · TypeScript · Vite(Rolldown)· TanStack Router · TanStack Query · Zustand · Tailwind(preflight)。

## 快速开始

```bash
npm install
npm run dev        # 本地开发(同一 HTML 注入流程)
npm run build      # tsc -b && vite build
npm run preview    # 预览构建产物
npm test           # vitest
npm run lint       # eslint
npm run format     # prettier --write .
```

质量闸门:`lint` / `test` / `build` / `format:check` 四项均为必过项(Jenkins 只跑 build,本地提交前请跑全)。

## 目录与分层

```
src/
├─ app/          # 应用外壳:路由表、懒加载包装(lazyPages)、根布局、全局热键
├─ pages/        # 路由页面:Home / Uses / Now
├─ features/     # 业务域:每个目录自带 public 出口 index.ts
│  ├─ command/   #   指令面板:filter.ts / commands.ts / CommandPalette.tsx
│  ├─ github/    #   贡献热力图与 star:api.ts / useGithubData.ts / Heatmap.tsx
│  ├─ hitokoto/  #   一言:api.ts / useHitokoto.ts / HitokotoCard.tsx
│  └─ terminal/  #   终端彩蛋:commands.ts / hotkey.ts / state.ts / command.ts / Terminal.tsx
├─ components/   # 跨页 UI 原语(当前仅 BentoCard)
├─ content/      # 站点内容(单一真相源)
├─ lib/          # 无业务依赖的基础设施:http / accent / md / command 类型
└─ store/        # 全局浮层开关(zustand)
```

**依赖方向**(自上而下,禁止反向):

```
pages / components
      ↓
features  ──(仅可经对方 index.ts)──→ features
      ↓
content / lib
```

- `app/` 是组合根:只能 import feature 的 public 出口(index.ts)与组件入口文件;
- `lib/` 不 import 任何上层(可被全部层依赖);
- 组件不直接发请求:组件 → `useXxx.ts`(useQuery)→ `api.ts`(经 `lib/http`)。

## 命名与结构约定

| 对象            | 约定                              | 反例(已修正)                    |
| --------------- | --------------------------------- | ------------------------------- |
| 组件            | PascalCase 文件 + 默认导出        | —                               |
| 自定义 hook     | `useXxx.ts`,单文件可只含一个 hook | `hooks.ts` 通用抽屉             |
| 纯函数/常量文件 | camelCase,按职责命名              | `registry.ts` 里没有注册表      |
| 常量            | 不得使用 `use` 前缀               | `useSections`                   |
| 懒加载包装      | 与页面实现区分命名                | `app/pages.ts` 与 `pages/` 同名 |

- 每个 feature 的 public 出口是 `index.ts`,**只导出非组件 API**(hook / 函数 / 命令条目);
  组件按路径导入(如 `@/features/hitokoto/HitokotoCard`),避免 barrel 把组件拉进无关 chunk。
- feature 之间只允许通过对方 `index.ts` 交互;`app/` 不内嵌任何 feature 的触发规则。
- 目前不引入全局 `utils/`、`helpers/`、`common/`;确有跨域工具时按职责放 `lib/` 并说明不变量。

## 内容维护

| 内容                                                              | 位置                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------ |
| 站点名 / tagline / 域名 / 建站日期 / 关键词 / GitHub / 邮箱 / ICP | [src/content/site.ts](src/content/site.ts)                   |
| 首页精选项目(REPO=null 表示占位行)                                | [src/content/projects.data.ts](src/content/projects.data.ts) |
| /uses 装备清单                                                    | [src/content/uses.ts](src/content/uses.ts)                   |
| /now 近况条目(frontmatter `date` / `title`,文件名即 slug)         | `src/content/now/*.md`                                       |
| 一言失败降级池                                                    | [src/content/quotes.ts](src/content/quotes.ts)               |

**站点身份单一真相源**:`index.html` 的 `<title>` / `<meta name="description">` 是占位符,
由 `vite.config.ts` 的 `site-meta` 插件在构建/开发期从 `site.ts` 注入;终端 `neofetch` 的
host 与 Uptime 也读 `site.ts`。改名/换域名只改一个文件。

## 数据契约与降级

- 外部请求统一走 [src/lib/http.ts](src/lib/http.ts) 的 `fetchParsed`:**8s 超时 + AbortController**,
  非 2xx / 网络异常 / 解析异常 / `parse` 抛错一律返回 `null`,不抛错、不弹错。
- 重试交给 TanStack Query(`retry: 1`),限流靠 `staleTime`(GitHub 与一言均为 1h/10min 命名常量)。
- UI 只为 `null` 渲染占位符:热力图显示 `—` 与灰色空格,一言回落到内置语录池。

## 命令系统

- 面板命令表在 [src/features/command/commands.ts](src/features/command/commands.ts):
  `createCommands({ navigate, toast })` 是纯函数,导航与 toast 由外部注入,可脱离 DOM 单测。
- feature 自己的命令由 feature 声明(如 [src/features/terminal/command.ts](src/features/terminal/command.ts)),
  `command` 只做汇总——新增终端/一言类条目不需要改面板组件。
- 终端解释器 [src/features/terminal/commands.ts](src/features/terminal/commands.ts) 的
  `executeCommand` 同样是纯函数;`~` 热键在 `hotkey.ts`,打开语义在 `state.ts`,
  三者都由 terminal 的 `index.ts` 对外提供。

## 样式

- 设计令牌与全部视觉规则在 [src/index.css](src/index.css);Tailwind **仅提供 preflight 与
  `@theme` 令牌桥接**,项目内不使用工具类(保留它是因为移除会改变视觉基线,且无浏览器验证)。
- 强调色:三色由 `data-accent` 驱动,新增第 4 色需同步 `lib/accent.ts` 的 `ACCENTS`
  与 `index.css` 的两段 `:root[data-accent=…]`(索引页的防闪烁内联脚本无需改动)。

## 决策记录

| 日期    | 决策                                                  | 原因                                                              |
| ------- | ----------------------------------------------------- | ----------------------------------------------------------------- |
| 2026-10 | 删除 `.env` 与 `VITE_*` 类型声明,内容统一到 `site.ts` | 环境变量从未被读取,且站点名已与 `.env` 不一致;声明了不存在的契约  |
| 2026-10 | 为 feature 增加 `index.ts` public 出口                | 消除 `app/hotkeys → feature` 与 `feature → feature` 的越界 import |
| 2026-10 | 命令表移出 `CommandPalette`                           | 面板曾同时承担命令定义、副作用与渲染,且无法单测                   |
| 2026-10 | 终端热键、打开语义、命令条目归 `features/terminal`    | 让"终端是什么"在一个目录内可读完                                  |
| 2026-10 | 保留 Tailwind,但只作为 preflight                      | 移除会改变视觉基线,当前无浏览器回归验证手段                       |
| 2026-10 | 不引入 barrel 导出组件                                | 会把懒加载组件拉进主包,破坏 code splitting                        |

## 已知约束

- 路由为手写路由表:新增页面需同步 `src/pages/X.tsx`、`src/app/lazyPages.ts`、`src/app/router.tsx`。
- 无 ErrorBoundary 与自定义 `notFoundComponent`(TanStack 默认 404)。
- 构建产物分包依赖 `manualChunks` 与动态 import,改动 feature 入口后请检查 `dist/assets/js/` 分包是否仍成立。
