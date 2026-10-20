/**
 * 站点级静态信息(Cmd+K / 终端 / Hero / 页脚 / HTML meta 共用)。
 *
 * **唯一真相源**:改站点名、域名、建站日期只改这里。
 * - index.html 的 title/description 由 vite.config.ts 的 site-meta 插件
 *   在构建期从此对象注入(占位符 __SITE_TITLE__ / __SITE_DESCRIPTION__);
 * - 终端 neofetch 的 host / Uptime 也读这里,不再各自硬编码。
 */
export const site = {
  name: '呓语小屋',
  tagline: '把想法变成代码的人',
  /** 站点域名(终端 host 段展示) */
  host: 'zhaozeyu.top',
  /** 建站日期 YYYY-MM-DD(终端 Uptime 由此计算) */
  siteStart: '2026-10-19',
  /** 个人信息键值名片(Hero 卡展示,neofetch 风);label 用英文短键配合等宽字体,文案由站长替换 */
  facts: [
    { label: 'ID', value: 'ZZY' },
    { label: 'AGE', value: '25' },
    { label: 'LOC', value: '深圳' },
    { label: 'ROLE', value: '中级前端开发者' },
    { label: 'NEXT', value: '学 Rust → 转全栈' },
  ],
  keywords: ['Vue3', 'React', 'Rust', 'TypeScript', 'AI', 'Vibe Coding'],
  githubUser: 'zzy-cl',
  github: 'https://github.com/zzy-cl',
  email: '',
  /** ICP 备案号(国内服务器合规要求);托管迁出大陆后可清空,页脚将自动隐藏 */
  icp: '湘ICP备2022018737号-1',
} as const;
