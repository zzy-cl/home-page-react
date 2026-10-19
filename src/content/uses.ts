/** /uses 清单(设计稿 uses.html 文案)。内容由站长随时替换。 */
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
    items: [{ name: '自组装台式机', note: '自己选件自己装,深夜工位的实体部分。' }],
  },
  {
    title: '编辑器与工具',
    items: [
      { name: 'VS Code', note: '主力编辑器,装完必要的插件就开始干活。' },
      { name: 'Claude Code', note: 'Vibe Coding 的日常搭档。' },
    ],
  },
  {
    title: '技术栈',
    items: [
      { name: 'Vue3', note: '组件化的日常选择,顺手。' },
      { name: 'React', note: '另一套心智模型,按项目选型。' },
      { name: 'TypeScript', note: '类型即文档。' },
      { name: 'Rust', note: '在写一个 WASM 粒子引擎,把简历上的词变成可点的 demo。' },
      { name: 'AI', note: '前沿科技的实验田,也是日常工具流。' },
      { name: 'Vibe Coding', note: '先和 AI 把想法聊明白,再一起落成代码。' },
    ],
  },
  {
    title: '服务',
    items: [
      { name: 'GitHub', note: '代码、issue 和贡献图都在这里。' },
      { name: 'Jenkins', note: '自托管 CI,本站就是它部署的。' },
    ],
  },
]
