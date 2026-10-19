/** 首页精选项目。repo 为 null = 无仓库的占位行(纯文本 + `--` star,设计稿结构)。 */
export interface ProjectInfo {
  /** 'owner/name';null 表示尚无仓库(占位行) */
  repo: string | null;
  name: string;
  desc: string;
}

export const projects: ProjectInfo[] = [
  {
    repo: 'zzy-cl/home-page-react',
    name: '呓语小屋',
    desc: '本站——从起始页彻底重设计的个人主页',
  },
  { repo: null, name: '占位项目 A', desc: '站长替换为自己的项目' },
  { repo: null, name: '占位项目 B', desc: '站长替换为自己的项目' },
];
