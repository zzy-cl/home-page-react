/** 首页精选项目(3 个,star 数由 GitHub API 实时刷新)。repo 为 'owner/name'。 */
export interface ProjectInfo {
  /** 'owner/name' 形式,star 数据请求路径 */
  repo: string
  name: string
  desc: string
}

export const projects: ProjectInfo[] = [
  {
    repo: 'zzy-cl/home-page-react',
    name: '呓语工位',
    desc: '本站——从起始页彻底重设计的开发者工位',
  },
  {
    repo: 'zzy-cl/demo-repo-a',
    name: '占位项目 A',
    desc: '站长替换为自己的项目',
  },
  {
    repo: 'zzy-cl/demo-repo-b',
    name: '占位项目 B',
    desc: '站长替换为自己的项目',
  },
]
