import { site } from '@/content/site';
import { applyAccent, currentAccentKey, nextAccentKey } from '@/lib/accent';
import type { UiCommand } from '@/lib/command';
import { fetchHitokoto } from '@/features/hitokoto';
import { terminalCommand } from '@/features/terminal';

/** 面板可导航的站内路径(导航能力由应用外壳注入) */
export type CommandNav = (to: '/' | '/uses' | '/now') => void;

/** 命令执行所需的外部能力:全部由参数注入,本模块不依赖 app/router 与 DOM */
export interface CommandDeps {
  navigate: CommandNav;
  toast: (msg: string) => void;
}

/**
 * 构建命令表(纯函数,可在 node 环境直接单测)。
 *
 * 归属划分:
 * - 导航 / 链接 / 主题是面板自身的通用能力,在此声明;
 * - 终端等 feature 条目由对应 feature 的 public 出口提供(terminalCommand),
 *   面板只做汇总——新增 feature 命令不必改面板组件。
 */
export function createCommands({ navigate, toast }: CommandDeps): UiCommand[] {
  const links: UiCommand[] = [
    {
      id: 'open-github',
      title: '打开:GitHub',
      desc: `github.com/${site.githubUser},新窗口打开`,
      hint: '↗',
      keywords: ['github', '仓库', '开源', site.githubUser],
      section: '链接',
      action: () => window.open(site.github, '_blank', 'noopener'),
    },
  ];
  // email 可选:site.email 未配置则不出现该命令
  if (site.email) {
    links.push({
      id: 'open-email',
      title: '打开:Email',
      desc: '来封邮件聊聊',
      hint: '✉',
      keywords: ['email', '邮件', '联系'],
      section: '链接',
      action: () => window.open(`mailto:${site.email}`, '_self'),
    });
  }

  const quoteCommand: UiCommand = {
    id: 'fun-quote',
    title: '一言:来一条',
    desc: '换一句话',
    hint: '↻',
    keywords: ['quote', '一言', 'hitokoto', '换'],
    section: '趣项',
    action: () => {
      // 面板内 toast 反馈;一言卡在首页,若不在首页则先回去
      void fetchHitokoto().then((h) => toast(h ? `${h.text} —— ${h.from}` : '一言获取失败'));
      if (typeof window !== 'undefined' && window.location.pathname !== '/') navigate('/');
    },
  };

  return [
    {
      id: 'nav-home',
      title: '前往:首页',
      desc: '回到 Bento 工位',
      hint: 'index',
      keywords: ['home', 'index', '首页', '工位', 'bento'],
      section: '导航',
      action: () => navigate('/'),
    },
    {
      id: 'nav-uses',
      title: '前往:装备清单',
      desc: '硬件、工具与技术栈',
      hint: '/uses',
      keywords: ['uses', 'gear', '装备', '工具', '技术栈'],
      section: '导航',
      action: () => navigate('/uses'),
    },
    {
      id: 'nav-now',
      title: '前往:近况',
      desc: '最近在折腾什么',
      hint: '/now',
      keywords: ['now', '近况', '动态'],
      section: '导航',
      action: () => navigate('/now'),
    },
    ...links,
    {
      id: 'theme-accent',
      title: '切换强调色',
      desc: '静谧蓝 → 暖橙 → 紫罗兰,立即全站生效',
      hint: '蓝→橙→紫',
      keywords: ['theme', 'accent', '主题', '颜色', '蓝', '橙', '紫'],
      section: '主题',
      keepOpen: true,
      action: () => {
        const msg = applyAccent(nextAccentKey(currentAccentKey()), true);
        if (msg) toast(msg);
      },
    },
    terminalCommand,
    quoteCommand,
  ];
}
