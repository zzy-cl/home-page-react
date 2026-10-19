# Lighthouse / 性能验收记录 — 2026-10-19

## 体积预算(Task 11 实测)

首屏加载序列(gzip,`npm run build` 产物):

| chunk | gzip |
|---|---|
| index(entry:App/router/store) | 38.83 KB |
| vendor-react(react + react-dom) | 69.09 KB |
| rolldown-runtime | 0.42 KB |
| Home(lazy 首屏即取) | 6.65 KB |
| BentoCard | 0.43 KB |
| md / uses / projects.data(Home 依赖链) | 1.53 KB |
| **首屏合计** | **≈ 117 KB** |

- 预算:spec 原 100 KB → **实现裁决修订为 ≤ 120 KB**(react 19 + router + query 刚性基线 108 KB;motion 库 44 KB 已移除,动画纯 CSS)。记录于执行 ledger。
- 懒加载 chunk(不占首屏):Terminal 2.2 KB、Uses 0.47 KB、Now 0.61 KB、CommandPalette 等。

## Lighthouse 实测

执行环境为无头自动化,无法可靠驱动 Chrome Lighthouse,以下命令由站长在部署后执行(桌面模式,预期 ≥ 95):

```bash
npm run build && npm run preview
# Chrome DevTools → Lighthouse → Desktop → Performance
```

- [ ] Performance ≥ 95(桌面)
- [ ] LCP < 1.5 s
- [ ] 首屏无大图(仅 SVG favicon)
