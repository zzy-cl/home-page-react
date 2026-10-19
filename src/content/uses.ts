/** /uses 清单(类型化数组——清单不需要富文本,spec §4.2)。内容由站长随时替换。 */
export interface UseItem {
  name: string
  /** 一句话使用语境 */
  note: string
}

export interface UseSection {
  title: '硬件' | '编辑器与工具' | '技术栈' | '服务'
  items: UseItem[]
}

export const useSections: UseSection[] = [
  {
    title: '硬件',
    items: [
      { name: '自组装台式机', note: '日常开发与构建,够用就好' },
      { name: '机械键盘', note: '写代码的体感来源' },
    ],
  },
  {
    title: '编辑器与工具',
    items: [
      { name: 'VS Code', note: '主力编辑器,配置极简' },
      { name: 'Claude Code', note: 'Vibe Coding 的日常搭档' },
      { name: 'Windows Terminal', note: '终端即工作台' },
    ],
  },
  {
    title: '技术栈',
    items: [
      { name: 'React / Vue3', note: '双栈前端,按项目气质选型' },
      { name: 'TypeScript', note: '类型是第一道测试' },
      { name: 'Rust', note: '在写一个 WASM 粒子引擎,把简历上的词变成可点的 demo' },
      { name: 'AI', note: '把 AI 当结对程序员,而不是自动补全' },
    ],
  },
  {
    title: '服务',
    items: [
      { name: 'Cloudflare', note: 'DNS 与边缘小函数' },
      { name: 'Jenkins', note: '自托管 CI,本站就是它部署的' },
    ],
  },
]
