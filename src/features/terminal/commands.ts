export interface TerminalLine {
  kind: 'input' | 'output' | 'error';
  text: string;
}

/** executeCommand 所需的站点快照(UI 层组装,纯函数只读) */
export interface TerminalContext {
  user: string;
  siteName: string;
  host: string;
  keywords: string[];
  /** 构建时间戳(__BUILD_TIME__ 注入,ISO) */
  buildTime: string;
  /** 建站日期 YYYY-MM-DD(运行天数由此计算) */
  siteStart: string;
  /** 当前强调色(设计稿 neofetch 的 Accent 行) */
  accentLabel: string;
  accentHex: string;
}

/**
 * `~`(或 `)键是否应打开终端(Review Focus 3):
 * 仅 ~ 或 `;按住 Ctrl/Cmd/Alt 不触发;input/textarea 聚焦、
 * 面板/终端已开(blocked)时不触发;target 未知时防御性不触发。
 * tagName 鸭子类型——避免引入 DOM 依赖,浏览器行为等价。
 */
export function shouldOpenTerminal(
  e: { key: string; target: unknown; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean },
  blocked: boolean,
): boolean {
  if (e.key !== '~' && e.key !== '`') return false;
  if (blocked) return false;
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  const tag = (e.target as { tagName?: string } | null)?.tagName;
  if (typeof tag !== 'string') return false;
  return tag !== 'INPUT' && tag !== 'TEXTAREA';
}

const HELP_LINES = [
  '可用命令:',
  '  help             显示本帮助',
  '  whoami           我是谁',
  '  skills           技术关键词表',
  '  neofetch         系统信息',
  '  clear            清屏',
  '  sudo rm -rf /    试试就知道 :)',
];

function daysSince(start: string): string {
  const ms = Date.now() - Date.parse(start);
  if (!Number.isFinite(ms)) return 'N';
  return String(Math.max(1, Math.ceil(ms / 86_400_000)));
}

function pad(s: string, n: number): string {
  let out = String(s);
  while (out.length < n) out += ' ';
  return out;
}

/**
 * 构建时间戳显示格式:ISO(UTC)→ `YYYY-MM-DD HH:mm:ss`。
 * 纯字符串截取、不做时区换算——展示值与构建机器的 toISOString() 一致。
 */
export function formatBuildTime(iso: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/.exec(iso);
  return m ? `${m[1]} ${m[2]}` : iso;
}

/** skills 两列 ASCII 表(设计稿规格) */
function skillsAscii(keywords: string[]): string {
  const rows: Array<[string, string]> = [];
  for (let i = 0; i < keywords.length; i += 2) {
    rows.push([keywords[i], keywords[i + 1] ?? '']);
  }
  const W1 = 12;
  const W2 = 14;
  const bar = (l: string, m: string, r: string) =>
    l + new Array(W1 + 1).join('─') + m + new Array(W2 + 1).join('─') + r;
  const out = [bar('┌', '┬', '┐')];
  rows.forEach((r, i) => {
    out.push(`│ ${pad(r[0], W1 - 1)}│ ${pad(r[1], W2 - 1)}│`);
    if (i < rows.length - 1) out.push(bar('├', '┼', '┤'));
  });
  out.push(bar('└', '┴', '┘'));
  return out.join('\n');
}

/** 执行终端命令。特殊信号:__CLEAR__ 清屏、__SHAKE__ 抖动(UI 层消费) */
export function executeCommand(input: string, ctx: TerminalContext): TerminalLine[] {
  const cmd = input.trim().toLowerCase();
  if (!cmd) return [];

  const print = (text: string, kind: TerminalLine['kind'] = 'output'): TerminalLine => ({
    kind,
    text,
  });

  // sudo 变体:任意同时包含 sudo 与 rm 的输入
  if (cmd.includes('sudo') && cmd.includes('rm')) {
    return [print('__SHAKE__'), print('权限拒绝:这里是我的工位 :)', 'error')];
  }

  switch (cmd) {
    case 'help':
      return HELP_LINES.map((l) => print(l));

    case 'whoami':
      return [print(`${ctx.user} —— 把想法变成代码的人`)];

    case 'skills':
      return [print(skillsAscii(ctx.keywords))];

    case 'neofetch':
      return [
        print(`${ctx.siteName}@${ctx.host}`),
        print('─────────────────────────'),
        print(`OS:      ${ctx.siteName} (Glass 2.0)`),
        print(`Host:    前端开发者的数字小屋`),
        print(`Uptime:  ${daysSince(ctx.siteStart)} 天`),
        print('Shell:   monologue-sh 1.0'),
        print(`Build:   ${formatBuildTime(ctx.buildTime)}`),
        print(`Accent:  ${ctx.accentLabel} ${ctx.accentHex}`),
      ];

    case 'clear':
      return [print('__CLEAR__')];

    default:
      return [print(`command not found: ${cmd},输入 help 查看可用命令`, 'error')];
  }
}
