# 呓语工位(Monologue Deck)— 呓语小屋 React 版重设计文档

> **日期**: 2026-10-19(v2,依站长反馈修订:在现有仓库内重写)
> **状态**: 待用户审阅
> **项目位置**: `home-page-react` 仓库内重写 — **不新建仓库**
> **前身**: 呓语小屋(React 起始页)
> **作者**: zzy × Claude

---

## 0. 重写策略(v2 核心变更)

在现有仓库 `home-page-react` 基础上**推翻页面、保留资产**:

- **保留不动**(已验证的工程资产):
  - `Jenkinsfile`、`Dockerfile`、`nginx.conf`、`deploy/docker-compose.yml` — 部署流水线,零改动
  - `docs/jenkins-deploy.md` — 部署文档
  - `eslint.config.js`、`tsconfig*.json`、`.gitignore` — 工程配置
- **按需调整**:
  - `vite.config.ts` — 移除 PWA 插件(v1 不做);manualChunks 按新依赖重排
  - `package.json` — 新增 `@tanstack/router`;移除 `aplayer`、`fetch-jsonp`、`swiper`、`@icon-park/react`(图标库换 `lucide-react`,线条风格贴合新设计语言);PWA 相关依赖一并移除
  - `.env` — 基础设施变量保留,页面文案变量按新内容重整
- **清空重写**:
  - `src/` 页面与组件全量重写
  - `public/images/`(壁纸、旧图标)与 `public/font/` 删除
  - `src/style/font/` 仅存新设计所需字体
- **分支策略**: master 直接推进(与站长既有工作流一致);旧版本随时可从 git 历史找回,清空完全可逆
- **部署产物不变**: 仍是 `dist/` 静态目录,Jenkins 构建命令 `npm run build` 不变 → **流水线无需任何修改**

---

## 1. 项目定位

### 1.1 物种切换

| | 前身「呓语小屋」 | 本项目「呓语工位」 |
|---|---|---|
| 物种 | 个人起始页(自用工具) | 开发者身份站点(个人品牌) |
| 核心用户 | 站长本人 | 访客:同行、招聘者、朋友 |
| 成功标准 | 每天都想打开 | 10 秒内让人知道"你是谁、在玩什么、水平如何" |
| 布局 | 全屏壁纸 + 左右分栏 | Bento Grid 工位卡片 |

### 1.2 一句话定位

> **你的数字工位**——一个"正在工作中的开发者的桌面",访客是走进来的人。

### 1.3 品牌延续

保留「呓语」作为个人品牌(呓语小屋 → 呓语工位),域名与备案沿用现状。**Working title 为 `monologue-deck`,仓库名不变(仍是 home-page-react),站点名上线前由站长定稿。**

### 1.4 站长画像(设计依据)

- 前端开发者;技术身份:**Vue3 · React · Rust · TypeScript · AI · Vibe Coding**
- 关注前沿科技;开发爱好者,建站首要动机是表达 + 实验
- 审美偏好:暗色、玻璃材质、氛围感——但**壁纸与音乐播放器已确认移除(与工位设计语言不符)**,氛围由 Glass 2.0 材质本身承担

---

## 2. 信息架构

```
/            Bento 工位首页(核心,90% 的设计权重)
/uses        装备与技术栈清单
/now         近况页(数字花园式"最近在折腾什么")
─ 隐藏层 ─
Cmd+K        全局指令面板(导航/搜索/彩蛋入口)
~ 键         终端模式彩蛋
```

**明确不做(v1)**: 博客(架构预留 md 机制即可)、AI 分身、音乐播放器、全屏壁纸系统、PWA、访客统计。

### 2.1 旧资产处置

| 旧功能 | 处置 | 理由 |
|---|---|---|
| 音乐播放器(APlayer) | **移除** | 与工位设计语言不符;依赖链(aplayer/fetch-jsonp)一并清除 |
| 壁纸系统 | **移除** | 同上;氛围改由玻璃材质 + 强调色承担 |
| 一言(hitokoto) | **降级保留**:终端 `fortune` 命令 + 迷你卡(默认开) | 低成本高风味 |
| 时光胶囊 | 不迁移 | 精神继承给 `/now` |
| 自定义光标 | **移除**(已于 2026-10-15 删除) | 性能教训 |
| 禁用右键 | **不迁移** | 开放精神 |
| PWA | 延后 v2 | manifest 内容全变,重做无意义 |

---

## 3. 视觉设计系统:「Glass 2.0」

延续站长的液态玻璃审美,但比前身更克制:玻璃只做材质,不做视觉主角;信息与留白优先。

### 3.1 设计令牌(初值,实现时可微调)

```css
:root {
  /* 底色:深空灰阶,非纯黑 */
  --bg-0: #0d0f12;          /* 页面底 */
  --bg-1: #16181d;          /* 卡片基底 */

  /* 玻璃材质 */
  --glass-bg: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-blur: 20px;
  --glass-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.12);

  /* 强调色:一处高饱和,全站唯一 */
  --accent: #7aa2ff;        /* 静谧蓝,链接/焦点/进度 */
  --accent-glow: rgba(122, 162, 255, 0.35);

  /* 文字 */
  --text-0: #e8eaed;
  --text-1: #9aa0a6;
  --text-2: #5f6368;

  /* 字体:系统栈 + 等宽(开发者身份符号) */
  --font-sans: 'HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  /* JetBrains Mono 自托管 woff2(仅 latin 子集,约 50KB);
     未加载完成或加载失败时回退 Cascadia Code / Consolas */
  --font-mono: 'JetBrains Mono', 'Cascadia Code', Consolas, monospace;

  /* 几何 */
  --radius-card: 16px;
  --radius-inner: 10px;
  --gap-grid: 12px;
}
```

**等宽字体是本站的身份符号**:数字、时间、命令行、技术关键词一律 mono。

### 3.2 动效原则(前身教训制度化)

- 只动画 `transform` 与 `opacity`;禁止动画 `width/left/top/box-shadow`
- 任何 rAF 循环必须有休眠条件(不可见/无变化即停)
- 卡片入场:交错 fade + translateY(12px),总时长 < 600ms
- hover:scale(1.01) + 边框提亮,克制不花哨

---

## 4. 页面详细设计

### 4.1 首页 Bento Grid(12 列网格,响应式 3→2→1 列)

```
┌─────────────────────────┬───────────┬────────────┐
│ HERO (span 7, row 2)    │ GitHub    │ /now 摘要  │
│ 呓语 / 一句话身份        │ 热力图    │ (span 3)   │
│ 技术关键词 mono 标签     │ (span 3)  │            │
├─────────────┬───────────┴───────────┴────────────┤
│ 精选项目 ×3 │ /uses 摘要卡 │ 一言迷你卡 │ Cmd+K │
│ (span 6)    │ (span 2)     │ (span 2)   │ 提示  │
└─────────────┴──────────────┴────────────┴───────┘
```

**卡片规格:**

1. **Hero**:名字大字(sans)、一句话身份、技术关键词 mono 标签行(Vue3 / React / Rust / TS / AI / Vibe Coding),关键词逐个 stagger 入场
2. **GitHub 热力图**:近 12 个月贡献格,GitHub REST API(公开接口,无认证;客户端懒取,失败静默降级为占位)。格子用 accent 色阶
3. **精选项目 ×3**:仓库名 + 一句话描述 + star 数(实时)+ 语言徽标;数据硬编码于 `projects.data.ts`(**实现期先放 3 个占位仓库,站长随时替换**),star 数走 GitHub API 刷新
4. **/now 摘要**:当前 1 条置顶动态 + 「查看全部 →」
5. **/uses 摘要**:3 个代表装备 + 「查看全部 →」
6. **一言迷你卡**:点击换一条(降级方案:请求失败显示固定语句)
7. **Cmd+K 提示条**:仅渲染 `⌘K` kbd 样式,点击呼出面板

### 4.2 /uses

数据源:`src/content/uses.ts`(类型化数组,非 MDX——清单不需要富文本)。

分区:**硬件 / 编辑器与工具 / 技术栈 / 服务**。每项:`名称 + 一句话使用语境`(如 "Rust —— 在写一个 WASM 粒子引擎,为了把简历上的词变成可点的 demo")。

### 4.3 /now

数据源:`src/content/now/*.md`(带 frontmatter 的 md 文件 + vite glob import;**这正是未来博客的接入机制**)。

条目结构:`日期 + 标题 + 正文(纯文本段落)`。按日期倒序,首条作为首页摘要卡数据。

---

## 5. 创意层

### 5.1 Cmd+K 指令面板

- 触发:`Ctrl/Cmd + K` 或点击提示条;`Esc` 关闭;`↑↓` 选择;`Enter` 执行
- 实现:**自研**(约 200 行,基于 `<dialog>` 或受控浮层),不引入 cmdk 依赖——组件量小,自研可控且零依赖负担
- 命令注册表(`src/features/command/registry.ts`):每条命令 `{ id, title, keywords, icon?, action }`,v1 命令清单:

| 命令 | 行为 |
|---|---|
| Go: 首页 / uses / now | 路由跳转 |
| Open: GitHub / Email | 外链 |
| Theme: accent 轮换 | 切换强调色(预置 3 色:静谧蓝 `#7aa2ff` / 暖橙 `#ff9e64` / 紫罗兰 `#b47aff`,存 localStorage,实现时可调) |
| Terminal | 呼出终端彩蛋 |
| fortune | 弹出一条一言 toast |

### 5.2 终端模式

- 触发:`~`(反引号)键或 Cmd+K 里的 `Terminal` 命令;**任意 input/textarea 聚焦时、或 Cmd+K 面板打开时不触发**,避免与快捷输入冲突
- 形态:全屏浮层内的伪终端,React 渲染输出(非真 shell),mono 字体,支持历史(↑)
- 命令清单(v1):

| 命令 | 输出 |
|---|---|
| `help` | 命令列表 |
| `whoami` | 站长一句话介绍 |
| `skills` | 技术栈 ASCII 图形化列表 |
| `projects` | 精选项目列表(可选中外链) |
| `now` | 最近一条 /now |
| `uses` | 装备摘要 |
| `fortune` | 一言 |
| `neofetch` | 站点信息 ASCII(版本/构建时间/运行天数) |
| `sudo rm -rf /` | 彩蛋响应(屏幕轻微抖动 + "权限拒绝:这里是我的工位") |
| 未知命令 | `command not found` + 提示 `help` |

---

## 6. 技术架构

### 6.1 技术栈

| 层 | 选择 | 理由 |
|---|---|---|
| 框架 | React 19 + TypeScript(strict) | 站长主栈,**现有项目即此栈** |
| 构建 | Vite | 现状延续 |
| 路由 | TanStack Router(新增) | 类型安全、预加载 |
| 数据 | TanStack Query | 现状延续,GitHub API 缓存 |
| 样式 | Tailwind CSS 4 + CSS 变量令牌 | 现状延续 |
| 动效 | motion | 现状延续 |
| 图标 | lucide-react(新增,替代 @icon-park) | 线条风格贴合 Glass 2.0 |
| 测试 | Vitest(仅核心逻辑) | 命令注册表/数据解析 |
| 部署 | **现有 Jenkins + Docker Compose 流水线,零改动** | 见 §8 |

### 6.2 目录结构(重写后)

```
home-page-react/
├── Jenkinsfile / Dockerfile / nginx.conf / deploy/   # 不动
├── src/
│   ├── app/              # 入口、Router、Provider
│   ├── components/       # BentoCard、GlassPanel、Kbd 等原语
│   ├── features/
│   │   ├── command/      # Cmd+K 面板 + 命令注册表
│   │   ├── terminal/     # 终端彩蛋
│   │   ├── github/       # 热力图、star 数据
│   │   └── hitokoto/     # 一言
│   ├── pages/            # Home / Uses / Now
│   ├── content/          # uses.ts + now/*.md
│   └── lib/              # tokens.css、工具
```

### 6.3 数据流

- **静态内容**(uses/now/项目清单):构建时导入,零运行时成本
- **GitHub 数据**(热力图/star):客户端 TanStack Query,staleTime 1h,失败静默降级(卡片显示占位骨架,不打扰)
- **一言**:客户端 fetch,staleTime 10min

### 6.4 路由级代码分割

`/`、`/uses`、`/now` 各自 lazy;终端与 Cmd+K 仅在首次触发时动态 import(彩蛋不占首屏预算)。

---

## 7. 性能预算(硬性红线)

| 指标 | 预算 |
|---|---|
| 首页 JS(gzip) | < 100 KB |
| Lighthouse Performance(桌面) | ≥ 95 |
| LCP | < 1.5 s |
| 动画 | 仅 transform/opacity;rAF 必须可休眠 |
| 图片 | 首页零大图(无壁纸),头像 1 张 < 30 KB |

每个里程碑验收时本地 Lighthouse 实测(不进 Jenkins 流水线)。

---

## 8. 部署(现有流水线,零改动)

**现状已验证,全部沿用:**

- `Jenkinsfile`:构建镜像 `home-page:latest` → `docker compose -f deploy/docker-compose.yml up -d`
- `Dockerfile`:node:24-alpine 构建(npmmirror 源)→ nginx:alpine 托管 `dist/`
- `nginx.conf`:SPA fallback(`try_files $uri $uri/ /index.html`)**已存在** + `gzip_static on` 直接吃 vite-plugin-compression2 的 .gz 产物
- 容器内 nginx 监听 80,宿主端口 5081;TLS 终止方式维持现状不变
- 构建命令 `npm run build` 不变 → **重写期间流水线全程可用,每次 push 即部署最新版**

---

## 9. 测试策略(最小化)

- **必须测**:命令注册表(命令匹配/执行分发)、终端命令解析、now.md frontmatter 解析
- **不测**:纯展示组件(视觉验收代替)
- 工具:Vitest + 无 DOM 依赖的纯函数测试

---

## 10. 里程碑

| 里程碑 | 内容 | 验收 |
|---|---|---|
| M1 | 清空 src + 骨架重建(路由/令牌/Bento 静态假数据) | 首页可视,流水线正常出图,Lighthouse ≥ 95 |
| M2 | GitHub 数据接入 + 一言 + uses/now 页面 | 真实数据渲染,失败降级正常 |
| M3 | Cmd+K + 终端彩蛋 | 命令全清单可跑,动态加载生效 |
| M4 | 内容填充 + 响应式打磨 | 375px~1920px 无横向滚动 |
| M5 | 上线验收 | 生产域名实测,Lighthouse 实测归档 |

> 注:M1 即"清空重建",流水线在 M1 结束后就恢复可部署状态——中途 Jenkins 可能构建出中间态页面,可接受。

---

## 11. 风险与对策

| 风险 | 对策 |
|---|---|
| GitHub API 限流(60/h 无认证) | staleTime 1h + 失败降级;不足则服务器侧 nginx 反代 GitHub API 并注入 token |
| 热力图数据量大拖慢首屏 | 热力图卡片独立 lazy,不阻塞 Hero |
| 重写期间 Jenkins 部署中间态 | M1 压缩到单次会话完成;必要时 Jenkins 暂停自动触发 |
| 创意层范围蔓延 | v1 冻结在 Cmd+K + 终端;新想法记 backlog 不实现 |

---

## 12. 明确的 Backlog(v1 不做)

博客(/blog)、AI 数字分身、音乐播放器与可视化、PWA、访客统计、Rust/WASM 模块、多语言、云同步。
