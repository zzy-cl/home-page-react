/** 一言语录池:API 失败时的降级轮换源(设计稿 data.js;末条兼任固定降级句) */
export interface Quote {
  text: string;
  from: string;
}

export const quotes: Quote[] = [
  { text: '隐约雷鸣,阴霾天空,即使天无雨,我亦留此地。', from: '言叶之庭' },
  { text: 'Talk is cheap. Show me the code.', from: 'Linus Torvalds' },
  { text: '简单是可靠的先决条件。', from: 'Edsger W. Dijkstra' },
  { text: '过早的优化是万恶之源。', from: 'Donald Knuth' },
  { text: '代码是写给人看的,只是恰好能在机器上运行。', from: '《计算机程序的构造和解释》' },
  { text: '保持热爱,保持构建。', from: '呓语工位' },
];
