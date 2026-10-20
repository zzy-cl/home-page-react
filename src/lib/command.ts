/**
 * 命令契约(跨层共享)。
 *
 * 放在 lib/ 而非 features/command 的原因:终端等 feature 需要声明自己的
 * 命令面板条目(`terminalCommand`),若把契约放在 command feature 里,
 * 就会形成 command ⇄ terminal 的循环依赖。此处只放类型,无运行时值。
 */

export type CommandSection = '导航' | '链接' | '主题' | '趣项';

/** 命令面板的最小契约:可搜索、可分组、可执行 */
export interface Command {
  id: string;
  title: string;
  keywords: string[];
  section: CommandSection;
  action: () => void;
}

/** 面板展示层附加的元数据(副标题、右侧提示、执行后是否保持打开) */
export interface UiCommand extends Command {
  desc: string;
  hint: string;
  /** 执行后面板保持打开(设计稿:主题切换需要看到 toast 反馈) */
  keepOpen?: boolean;
}
