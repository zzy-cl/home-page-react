/** 站点级静态信息(Cmd+K / 终端 / Hero / 页脚共用)。文案由站长随时替换。 */
export const site = {
  name: '呓语小屋',
  tagline: '把想法变成代码的人',
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
